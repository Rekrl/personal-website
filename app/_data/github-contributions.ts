// Server-only: fetches the GitHub contribution calendar via the GraphQL
// API (ticket #19's decision), authenticated with a token that must
// never reach the client. Cached with `next.revalidate` instead of
// being called on every request.

export interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0 (none) .. 4 (most)
  weekday: number; // 0 = Sunday .. 6 = Saturday
}

export interface ContributionWeek {
  days: ContributionDay[];
}

export interface ContributionData {
  weeks: ContributionWeek[];
  total: number;
}

const LEVEL_MAP: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const QUERY = `
  query {
    viewer {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              contributionLevel
              date
              weekday
            }
          }
        }
      }
    }
  }
`;

const REVALIDATE_SECONDS = 60 * 60 * 6; // 6 hours

interface GraphQLDay {
  contributionCount: number;
  contributionLevel: string;
  date: string;
  weekday: number;
}

interface GraphQLWeek {
  contributionDays: GraphQLDay[];
}

interface GraphQLResponse {
  data?: {
    viewer?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: GraphQLWeek[];
        };
      };
    };
  };
}

// Returns null on any failure (missing token, network error, GitHub API
// error) so the homepage renders fine without the heatmap rather than
// crashing the page.
export async function getContributionData(): Promise<ContributionData | null> {
  const token = process.env.GITHUB_CONTRIBUTIONS_TOKEN;
  if (!token) {
    console.warn("GithubHeatmap: GITHUB_CONTRIBUTIONS_TOKEN is not set, skipping.");
    return null;
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY }),
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      console.error(`GithubHeatmap: GitHub API responded ${res.status} ${res.statusText}`);
      return null;
    }

    const json: GraphQLResponse = await res.json();
    const calendar = json.data?.viewer?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      console.error("GithubHeatmap: unexpected GraphQL response shape", json);
      return null;
    }

    const weeks: ContributionWeek[] = calendar.weeks.map((week) => ({
      days: week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVEL_MAP[day.contributionLevel] ?? 0,
        weekday: day.weekday,
      })),
    }));

    return { weeks, total: calendar.totalContributions };
  } catch (error) {
    console.error("GithubHeatmap: failed to fetch contribution data", error);
    return null;
  }
}
