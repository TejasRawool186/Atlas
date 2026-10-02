# Certificate Engine — HMAC-SHA256 Merkle Tree

## Process

1. All evidence items (claims, sources, relationships, conflicts) are serialised to canonical strings
2. Each string is SHA-256 hashed → a Merkle leaf
3. Leaves are paired and hashed together recursively until a single root hash remains
4. The root hash is signed with HMAC-SHA256 using `CERTIFICATE_HMAC_SECRET`
5. The full certificate is stored with the investigation

## Certificate Fields

```
certificateId    CERT-{YEAR}-{8-char hex}
investigationId  INV-{YEAR}-{5 digits}
question         Original user question
verdict          SUPPORTED | PARTIALLY_SUPPORTED | CONTRADICTED | INSUFFICIENT_EVIDENCE
evidenceCount    Total evidence items hashed
evidenceRoot     Merkle root SHA-256 hex
signature        HMAC-SHA256(evidenceRoot, secret)
algorithm        SHA-256 / HMAC-SHA256
createdAt        ISO timestamp
merkleTree.leaves  Array of { hash, type, id, summary }
merkleTree.root    Same as evidenceRoot
merkleTree.depth   Tree depth
```

## Verification

POST `/api/certificates/:id/verify`

Recomputes the Merkle root from stored leaves and verifies the HMAC. If tampered evidence is provided, the recomputed root will differ from the stored root — tamper detection confirmed.

## Security Notes

- `CERTIFICATE_HMAC_SECRET` never leaves the server
- Certificates are degraded (but still generated) if secret is unconfigured
- System status endpoint shows `certificate: degraded` when secret is missing
