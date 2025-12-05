# Streamable HTTP recommended for new MCP servers

**Type:** Deprecation
**Status:** Draft - needs comms review

## Summary

We recommend that all new MCP servers use Streamable HTTP transport instead of SSE (Server-Sent Events).

## Details

Claude.ai's MCP integration is optimizing for Streamable HTTP as the primary transport. While SSE servers will continue to work, they may experience reduced functionality over time, including:

- Reduced session persistence
- More frequent re-initialization

## Action Required

- **New servers**: Use Streamable HTTP transport
- **Existing SSE servers**: Consider migrating to Streamable HTTP

## Resources

- [MCP Connector Documentation](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector)
- [MCP Specification - Transports](https://spec.modelcontextprotocol.io)
