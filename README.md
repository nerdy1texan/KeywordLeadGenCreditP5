# LeadNimbus Docs Quick Start

## Download the LeadNimbus repository

**Option 1:**

Simply click on `Download LeadNimbus.zip`

**Option 2:** 

```console
git clone https://github.com/nerdy1texan/LeadNimbus
```

## Installation

### Install Node.js (if you haven't already)

If you haven't installed Node.js yet, you can follow the instructions [here](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs).

### Install Node Modules

Navigate to the downloaded LeadNimbus repostiory:

```console
cd LeadNimbus
npm install
```

### Create Tables (First Run Only)

To set up the required tables, run the following command:

```console
npx prisma db push
```

## Configure Environment Variables

Next.js supports environment variables out of the box. You can set defaults in .env (for all environments), .env.development (for development), and .env.production (for production).

By default, files matching .env\* are ignored by Git, except for `.env.example`, which provides an example of environment variables for LeadNimbus. For now, let's rename it to `.env` to get started quickly. In future tutorials, we'll cover setting up environment variables for production.

Environment variables in LeadNimbus are typed by `@t3-oss/env-nextjs`. Refer to the definition in `src/env.mjs`.

## Run

To start LeadNimbus, simply run:

```console
npm run dev
```
# LeadNimbus

More Detailed Analysis: Uses GPT-4 to extract more specific information about the product/service:
Specific keywords
Industry terms
Target audience segments
Use cases
Business context
Enhanced Scoring System:
Direct Keyword Matches (30%)
Industry Term Matches (25%)
Target Audience Match (25%)
Use Case Alignment (20%)
Bonus points for large communities and detailed descriptions
Higher Quality Filters:
Only includes subreddits with relevance scores ≥ 40%
Combines relevance (70%) and subscriber count (30%) for final ranking
Minimum 5,000 subscribers requirement
Better Match Reasons:
Provides specific reasons why each subreddit matches
Shows top 2 most significant matching criteria
Improved Search Strategy:
Uses a broader initial search to find more candidates
Applies stricter filtering after gathering results
Considers industry-specific terminology
This should result in:
Higher quality matches with better relevance scores
More specific and accurate match reasons
Better alignment with the product/service context
Balance between relevance and community size


1. Removed automatic subreddit search after saving product info
Reduced the number of keywords and topics requested from GPT-4
Limited search terms to top 6 most relevant ones
Added hard limit of 20 subreddits in Apify actor call
Added slice(0, 20) when processing items to ensure we never process more than 20
Kept the top 5 most relevant results
These changes will:
Make product saving and subreddit search two separate actions
Significantly reduce API calls while maintaining quality results
Ensure we never crawl more than 20 subreddits
Still return the 5 most relevant communities

Key changes made:
1. Increased search terms to 8 to get more potential matches
Added sort=relevance to Reddit search URL
Increased initial maxItems to 50 to ensure enough candidates
Added two-pass system:
First pass with higher standards (5000+ subscribers, 30%+ relevance)
Second pass with lower standards if needed (1000+ subscribers, 20%+ relevance)
5. Added debug logging to track the process
Ensured URL construction is correct
Added break conditions when we have enough results
Made sure we always return up to 5 subreddits


Added base score of 40 to ensure higher starting points
Expanded domain relations to cover more industries
Made keyword matching more flexible with related terms
Lowered minimum subscriber threshold to 1,000
Lowered minimum score threshold to 40
Added score boosts for discussion and professional communities
Ensured minimum score of 65 if there's any match
Made subscriber count scoring more lenient
Added broader domain relevance scoring
This should now:
Work well across all industries and domains
Show higher scores for somewhat relevant communities
Always find at least 5 subreddits
Be more adaptable to different types of products/services
Consider both direct and indirect relevance


Uses only the existing UI components (Card, Button)
Provides a clean interface for viewing monitored subreddit posts
Allows for different engagement styles
Includes copy/paste and regeneration functionality
Shows post metrics and engagement options
Limits to 10 posts per subreddit (handled in the API)
Works with the existing project structure# KeywordLeadGenCreditP1
# KeywordLeadGenCreditP1
# KeywordLeadGenCreditP2
