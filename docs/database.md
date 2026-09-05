# Database

Game Count uses SQLite as a zero-configuration local fallback
(`backend/game_count.db`, created automatically on first run) and can be
pointed at PostgreSQL/Supabase later by setting `DATABASE_URL` and
updating `backend/app/database/db.py` accordingly - it is the only file in
the codebase that talks to the database directly.

## Tables

### `surveys`

| Column                | Type    | Notes                                  |
|------------------------|---------|-----------------------------------------|
| id                    | integer | primary key                            |
| survey_name           | text    |                                         |
| survey_date           | text    |                                         |
| location              | text    |                                         |
| image_path            | text    | URL/path to the original upload        |
| annotated_image_path  | text    | URL/path to the annotated JPEG         |
| ai_total              | integer | AI-estimated total                     |
| verified_total        | integer | ranger-verified total                  |
| notes                 | text    |                                         |
| average_confidence    | real    | 0-1                                    |
| processing_time       | real    | seconds                                |
| status                | text    | `draft` or `verified`                  |
| created_at            | text    | ISO 8601 timestamp                     |
| updated_at            | text    | ISO 8601 timestamp                     |

### `species_counts`

| Column              | Type    | Notes                                |
|----------------------|---------|----------------------------------------|
| id                  | integer | primary key                           |
| survey_id           | integer | foreign key -> surveys.id, cascades on delete |
| species             | text    | elephant / giraffe / impala / springbok |
| ai_count            | integer |                                        |
| verified_count      | integer |                                        |
| average_confidence  | real    | 0-1                                   |
