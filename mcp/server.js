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
import {
  createEntitiesTool,
  createRelationsTool,
  addObservationsTool,
  deleteEntitiesTool,
  deleteObservationsTool,
  deleteRelationsTool,
  readGraphTool,
  searchNodesTool,
  openNodesTool,
  handleCreateEntities,
  handleCreateRelations,
  handleAddObservations,
  handleDeleteEntities,
  handleDeleteObservations,
  handleDeleteRelations,
  handleReadGraph,
  handleSearchNodes,
  handleOpenNodes,
} from './tools/memory.js';

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
      createEntitiesTool,
      createRelationsTool,
      addObservationsTool,
      deleteEntitiesTool,
      deleteObservationsTool,
      deleteRelationsTool,
      readGraphTool,
      searchNodesTool,
      openNodesTool,
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
      case 'memory_create_entities':
        return await handleCreateEntities(args);
      case 'memory_create_relations':
        return await handleCreateRelations(args);
      case 'memory_add_observations':
        return await handleAddObservations(args);
      case 'memory_delete_entities':
        return await handleDeleteEntities(args);
      case 'memory_delete_observations':
        return await handleDeleteObservations(args);
      case 'memory_delete_relations':
        return await handleDeleteRelations(args);
      case 'memory_read_graph':
        return await handleReadGraph(args);
      case 'memory_search_nodes':
        return await handleSearchNodes(args);
      case 'memory_open_nodes':
        return await handleOpenNodes(args);
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
