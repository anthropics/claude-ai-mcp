# MCP Context Usage Warning

**Type:** New Feature
**Status:** Draft - needs comms review

## Summary

Claude.ai now displays a notification when your enabled MCP servers consume more than approximately 20,000 tokens of context.

## Details

MCP server tool definitions are loaded into the context window at the start of each conversation, even when tools are not actively being used. Users with multiple MCP servers enabled may find their available context reduced significantly before any conversation begins.

To help users understand their context usage, Claude.ai will now display a warning notification when the combined token usage of all enabled MCP servers exceeds roughly 20,000 tokens (~15% of context on some plans).

### Example Context Usage

| MCP Server      | # Tools | Approx. Tokens |
|-----------------|---------|----------------|
| Asana           | 44      | ~36,800        |
| Gmail           | 6       | ~5,000         |
| Google Calendar | 9       | ~16,800        |
| Google Drive    | 5       | ~6,300         |
| **Total**       | **64**  | **~65,000**    |

## Action Required

No action required. If you see the notification and want to free up context:

1. Review your enabled MCP servers
2. Disable any servers you don't need for the current conversation
3. Re-enable them when needed

## Resources

- [MCP Connector Documentation](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector)
