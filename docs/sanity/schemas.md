# Sanity Schema Reference

All ATLAS schemas are defined in `backend/services/sanity/types.ts` and mirrored in `sanity-studio/schemaTypes/`.

## entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | string | yes | Unique document ID e.g. `ent_feature_x` |
| `name` | string | yes | Canonical entity name |
| `entityType` | enum | yes | framework \| feature \| organization \| standard \| database \| api \| protocol |
| `description` | text | no | Brief summary |
| `aliases` | string[] | no | Alternative names |
| `relatedEntities` | reference[] | no | References to other entities |

## claim

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `statement` | string | yes | Verifiable factual statement |
| `subject` | reference→entity | yes | What the claim is about |
| `predicate` | string | yes | Relational verb e.g. `introduced_in` |
| `object` | reference \| string | no | Entity or free text object |
| `sources` | reference[]→source | yes | Backing evidence |
| `validFrom` | datetime | no | When claim became true |
| `validUntil` | datetime | no | When claim was superseded |
| `status` | enum | yes | active \| superseded \| disputed \| retracted |
| `confidence` | enum | no | high \| medium \| low |

## source

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Document title |
| `url` | url | yes | Canonical source URL |
| `publisher` | string | no | Publishing organization |
| `publishedAt` | datetime | no | Publication date |
| `sourceType` | enum | yes | official_release \| documentation \| git_commit \| changelog \| rfcs \| benchmark \| community_forum |
| `author` | string | no | Author name |
| `excerpt` | text | no | Relevant excerpt |

## conflict

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `claimA` | reference→claim | yes | First conflicting claim |
| `claimB` | reference→claim | yes | Second conflicting claim |
| `conflictType` | enum | yes | TEMPORAL_CONFLICT \| ATTRIBUTE_CONFLICT \| FACTUAL_CONFLICT \| DEPRECATION_CONFLICT |
| `resolution` | string | no | Resolution code |
| `resolutionSource` | reference→source | no | Authoritative resolution source |
| `resolutionReason` | text | no | Human-readable resolution explanation |

## knowledge_doc

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | yes | Document title |
| `docType` | enum | yes | release_notes \| architecture_spec \| changelog \| technical_rfc \| security_advisory |
| `sourceUrl` | url | yes | Original source URL |
| `publishedAt` | datetime | yes | Publication date |
| `author` | string | yes | Author |
| `summary` | text | yes | Brief summary |
| `content` | text | no | Full document content |
| `extractedClaims` | string[] | no | Key claims extracted |
| `referencedEntities` | string[] | no | Entity IDs referenced |
