# Claude.ai MCP Integration

This repository is the communication hub for **MCP (Model Context Protocol) integration in Claude.ai**. Use it to stay updated on technical changes and to report bugs or request features.

## How to Stay Updated

**For announcements only** (low noise):
1. Go to [Discussions](../../discussions)
2. In the Announcements category, click **Subscribe**

You'll be notified of:
- Protocol changes (SSE deprecation, Streamable HTTP updates)
- Session behavior changes
- New MCP capabilities
- Breaking changes and deprecations
- Security updates

## Report a Bug or Request a Feature

Use [Issues](../../issues/new/choose) to:
- Report bugs with MCP servers or integrations
- Request new features or improvements

## Context Usage

**Important:** Enabled MCP servers consume context window space even when not actively used. Each server's tool definitions are loaded into context at the start of a conversation.

For example, servers with many tools can use significant context:
- A server with ~40 tools may use ~35,000+ tokens
- Multiple servers enabled simultaneously can quickly add up

**Recommendations:**
- Only enable MCP servers you plan to use in a conversation
- Disable unused servers to preserve context for your actual conversation
- If you notice conversations hitting context limits quickly, check your enabled MCP servers

A notification will appear in Claude.ai when your enabled MCP servers exceed approximately 20,000 tokens of context usage.

## What This Covers

- **Integrations** - Connecting MCP servers to Claude.ai
- **Session Management** - Initialization, reconnection, and lifecycle behavior
- **Protocol Support** - SSE, Streamable HTTP, transport changes
- **Tool & Resource Handling** - How Claude.ai discovers and invokes MCP tools
- **OAuth & Authentication** - Token handling for MCP servers

## What This Does NOT Cover

- The MCP specification itself → [modelcontextprotocol/specification](https://github.com/modelcontextprotocol/specification)
- MCP SDKs → [modelcontextprotocol](https://github.com/modelcontextprotocol)
- General Claude.ai issues (non-MCP) → [support.anthropic.com](https://support.anthropic.com)

## Resources

- [MCP Specification](https://spec.modelcontextprotocol.io)
- [MCP Directory](https://www.claudemcp.com)

## License

Use is subject to [Anthropic's Commercial Terms of Service](https://www.anthropic.com/legal/commercial-terms).
