# Content and publishing guide

## Source of truth

Update `src/data/site.ts` first whenever a core fact changes. Date, venue, application status, contact information, and the site-wide status should not be duplicated manually across pages.

Before changing a value from “to be confirmed”:

1. Identify the person responsible for the decision.
2. Keep written confirmation.
3. Confirm the exact public wording.
4. Update all affected operational documents and forms.
5. Build and preview the website before publishing.

## Content collections

Each item is one Markdown file with structured front matter. Use lowercase ASCII kebab-case filenames because the filename becomes the permanent URL.

Do not rename a published file casually. A rename changes its URL.

### Opportunity requirements

Every opportunity needs:

- a direct official source;
- organization and type;
- intended audience and location, when applicable;
- an exact deadline or `rolling: true`;
- a status;
- `verifiedAt`, recording when the source was last checked.

Archive or update expired opportunities. Summaries never override the official source.

### Resource requirements

Record the provider, resource type, topics, audience, level, external URL, available license information, and verification date. Listing is not necessarily endorsement.

### People, speakers, and partners

- List a speaker only after participation and public profile details are confirmed.
- Publish photographs and bios only with permission.
- Fellow and alumni profiles are opt-in. Set `consentToPublish: true` only after the person has reviewed every public field.
- Never store an unapproved biography, photograph, private email address, consent record, or internal note in this public repository—even in a draft file.
- A Fellow may request correction or removal of a profile at any time.
- Do not copy partner logos from search results or organizational websites.
- Obtain an approved logo file, usage guidance, alt text, and relationship wording.
- Clearly distinguish funder, partner, invited contributor, speaker affiliation, host, and vendor.

## Sensitive information

Never commit applications, emails, phone numbers, private biographies, identity or affinity preferences, dietary data, health or disability information, travel documents, reimbursement records, lodging assignments, review notes, or private project data.

Use an institutionally approved system with purpose, access, and retention rules for those workflows.

## Accessibility checklist

- Core information is available as HTML, not PDF only.
- Images have useful alt text or empty alt text when decorative.
- Videos have captions; important recordings have transcripts where feasible.
- Link text makes sense out of context.
- Headings follow a logical order.
- Tables are used for data, not layout, and work on small screens.
- Changes are understandable without relying on color alone.
- Dates include a year and, when relevant, time zone.

## Editorial workflow

For the initial version:

1. Create or edit a Markdown file on a branch.
2. Run `npm run qa`.
3. Review the generated preview.
4. Use a pull request for a second-person factual and editorial review.
5. Merge to `main` to deploy.

A browser-based CMS can be added after the content types and team permissions stabilize.
