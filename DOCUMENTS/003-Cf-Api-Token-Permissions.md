# CF API Token Permissions for Cloudflare CI
# These permissions cover:
#  – Workers Scripts
#  – D1 Databases
#  – R2 Buckets
#  – KV Namespaces
#  – Queues (Producer)
#  – AI Models
#  – Account (for token creation)
#  – Secrets (if you plan to manage them via API)
#
# Create a custom token template in the Cloudflare dashboard:
# 1. Template: **Full Access** or build a custom set.
# 2. Grant the following *Accounts* permissions (edit for each resource type):
#    • Workers Scripts: Edit
#    • D1 Databases: Edit
#    • R2 Buckets: Edit
#    • KV Namespaces: Edit
#    • Queues: Edit
#    • AI Models: Edit
#    • Account Settings: Edit (to create and revoke tokens)
# 3. Optionally add *User Management* > *Secrets*: Edit if you plan to store tokens via the API.
#
# Each of these sections provides Create, Read, Update, Delete, and List (CRUL) access.
# If you want to restrict to the minimal namespace IDs, refine the permissions at the *Resources* step.
