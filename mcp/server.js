import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { widgetListTool, handleWidgetList } from './tools/widget.js';
import {
  contentCreatePostTool,
  handleContentCreatePost,
} from './tools/content.js';
import {
  contentListPostsTool,
  contentEditPostTool,
  handleContentListPosts,
  handleContentEditPost,
} from './tools/blog-content.js';

const server = new Server(
  {
    name: 'mccal-media',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      widgetListTool,
      contentCreatePostTool,
      contentListPostsTool,
      contentEditPostTool,
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'widget_list':
        return await handleWidgetList(args);
      case 'content_create_post':
        return await handleContentCreatePost(args);
      case 'content_list_posts':
        return await handleContentListPosts(args);
      case 'content_edit_post':
        return await handleContentEditPost(args);
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error.message}`
    );
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('McCal Media MCP Server running on stdio');
