# Removal of path-aware `auth_server_metadata` discovery fallback when PRM is unavailable

**Type:** Deprecation
**Effective Date:** January 8, 2026

## Summary

As part of our adoption of the [2025-11-25 MCP specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization), Claude.ai no longer attempts path-aware authorization server metadata discovery for MCP servers that do not implement Protected Resource Metadata (PRM).

## Details

Previously, when connecting to MCP servers requiring OAuth authentication, if Protected Resource Metadata (PRM) discovery failed, Claude.ai would attempt path-aware authorization server metadata discovery by appending the MCP server's path to `/.well-known/oauth-authorization-server` (e.g., `/.well-known/oauth-authorization-server/v1/mcp`).

This path-aware fallback has been removed. Root-based discovery (`/.well-known/oauth-authorization-server`) and default endpoint conventions (`/authorize`, `/token`, `/register`) remain unchanged.

### Example

### Example of current behavior

For an MCP server at `https://mcp.example.com/v1/mcp`:

#### Without PRM

Authorization server metadata discovery only uses root-based discovery:

`https://mcp.example.com/.well-known/oauth-authorization-server`

The path-aware fallback is no longer attempted:

~~`https://mcp.example.com/.well-known/oauth-authorization-server/v1/mcp`~~

If root-based discovery also fails, the client falls back to
[default endpoint conventions](https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization#fallbacks-for-servers-without-metadata-discovery),
which are relative to the server's origin:

- **Authorization:** `https://mcp.example.com/authorize`
- **Token:** `https://mcp.example.com/token`
- **Registration:** `https://mcp.example.com/register`

#### With PRM returning an auth server with a path (recommended)

If the server implements PRM and returns an `authorization_servers` value
with a path (e.g., `https://auth.example.com/oauth/tenant42`), path-aware
discovery works as expected using the PRM-provided URL:

1. `https://auth.example.com/.well-known/oauth-authorization-server/oauth/tenant42`
2. `https://auth.example.com/.well-known/openid-configuration/oauth/tenant42`
3. `https://auth.example.com/oauth/tenant42/.well-known/openid-configuration`

#### With PRM returning an auth server at the root

If PRM returns a root-level authorization server
(e.g., `https://auth.example.com/`):

1. `https://auth.example.com/.well-known/oauth-authorization-server`
2. `https://auth.example.com/.well-known/openid-configuration`


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
