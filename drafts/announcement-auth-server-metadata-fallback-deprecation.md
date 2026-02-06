# Removal of path-aware `auth_server_metadata` discovery fallback when PRM is unavailable

**Type:** Deprecation
**Effective Date:** January 8, 2026

## Summary

As part of our adoption of the [2025-11-25 MCP specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization), Claude.ai no longer attempts path-aware authorization server metadata discovery for MCP servers that do not implement Protected Resource Metadata (PRM).

## Details

Previously, when connecting to MCP servers requiring OAuth authentication, Claude.ai would attempt a fallback discovery mechanism if the primary [Protected Resource Metadata (PRM)](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#2-3-1-protected-resource-metadata) discovery failed. This fallback looked for a path-aware authorization server metadata discovery URL.

This fallback behavior has been removed to align with the current MCP specification, which requires MCP servers to properly implement Protected Resource Metadata (PRM) for OAuth discovery.

### Example

For an MCP server at `https://mcp.example.com/v1/mcp` without PRM implemented, the authorization server metadata discovery will now only use root-based discovery:

`https://mcp.example.com/.well-known/oauth-authorization-server`

The path-aware fallback is no longer attempted:

~~`https://mcp.example.com/.well-known/oauth-authorization-server/v1/mcp`~~

If root-based authorization server metadata discovery also fails, the client will fall back to [default endpoint conventions](https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization#fallbacks-for-servers-without-metadata-discovery) relative to the server's origin:

- **Authorization:** `https://mcp.example.com/authorize`
- **Token:** `https://mcp.example.com/token`
- **Registration:** `https://mcp.example.com/register`

### Reference

The current authorization server metadata discovery logic can be found in the [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk/blob/1a943ad085dac042ccb705ab0ca307cb5de7229b/src/mcp/client/auth/utils.py#L122-L162).

## Who is affected

MCP servers that:
- Do not implement Protected Resource Metadata (PRM)
- Relied on the legacy path-aware `auth_server_metadata` discovery fallback

## Action required

If your MCP server's OAuth authentication stopped working after January 8, 2026:

1. **Implement Protected Resource Metadata (PRM)** — Update your MCP server to support the standard OAuth discovery flow as defined in the [MCP Authorization specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization).

2. **Review your authorization server metadata** — Ensure your OAuth endpoints are correctly defined and discoverable via PRM.

## Resources

- [MCP Authorization Specification (2025-11-25)](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)
- [Protected Resource Metadata](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#2-3-1-protected-resource-metadata)

## Questions

If you have questions about this change or need assistance migrating your MCP server, please open an issue in this repository.
