# Deprecation of auth_server_metadata discovery fallback

**Type:** Deprecation
**Effective Date:** January 8, 2026

## Summary

As part of our adoption of the [2025-11-25 MCP specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization), Claude.ai no longer supports the `auth_server_metadata` discovery fallback logic for OAuth authentication.

## Details

Previously, when connecting to MCP servers requiring OAuth authentication, Claude.ai would attempt a fallback discovery mechanism if the primary [Protected Resource Metadata (PRM)](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#2-3-1-protected-resource-metadata) discovery failed. This fallback looked for authorization server metadata at alternative URL paths.

This fallback behavior has been removed to align with the current MCP specification, which requires MCP servers to properly implement Protected Resource Metadata (PRM) for OAuth discovery.

## Who is affected

MCP servers that:
- Do not implement Protected Resource Metadata (PRM)
- Relied on the legacy `auth_server_metadata` fallback discovery mechanism

## Action Required

If your MCP server's OAuth authentication stopped working after January 8, 2026:

1. **Implement Protected Resource Metadata (PRM)** - Update your MCP server to support the standard OAuth discovery flow as defined in the [MCP Authorization specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)

2. **Review your authorization server metadata** - Ensure your OAuth endpoints are correctly defined and discoverable via PRM

## Resources

- [MCP Authorization Specification (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)
- [Protected Resource Metadata](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#2-3-1-protected-resource-metadata)

## Questions

If you have questions about this change or need assistance migrating your MCP server, please open an issue in this repository.
