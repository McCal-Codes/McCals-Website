import { memoryStore } from '../utils/memory-store.js';

// Tool Definitions
export const createEntitiesTool = {
  name: 'memory_create_entities',
  description: 'Create multiple new entities in the knowledge graph. Ignores entities with existing names.',
  inputSchema: {
    type: 'object',
    properties: {
      entities: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Entity identifier (unique)' },
            entityType: { type: 'string', description: 'Type classification (e.g., person, organization, event)' },
            observations: { type: 'array', items: { type: 'string' }, description: 'Associated observations' },
          },
          required: ['name', 'entityType'],
        },
      },
    },
    required: ['entities'],
  },
};

export const createRelationsTool = {
  name: 'memory_create_relations',
  description: 'Create multiple new relations between entities. Skips duplicate relations.',
  inputSchema: {
    type: 'object',
    properties: {
      relations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            from: { type: 'string', description: 'Source entity name' },
            to: { type: 'string', description: 'Target entity name' },
            relationType: { type: 'string', description: 'Relationship type in active voice (e.g., works_at, knows)' },
          },
          required: ['from', 'to', 'relationType'],
        },
      },
    },
    required: ['relations'],
  },
};

export const addObservationsTool = {
  name: 'memory_add_observations',
  description: 'Add new observations to existing entities. Returns added observations per entity. Fails if entity does not exist.',
  inputSchema: {
    type: 'object',
    properties: {
      observations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            entityName: { type: 'string', description: 'Target entity name' },
            contents: { type: 'array', items: { type: 'string' }, description: 'New observations to add' },
          },
          required: ['entityName', 'contents'],
        },
      },
    },
    required: ['observations'],
  },
};

export const deleteEntitiesTool = {
  name: 'memory_delete_entities',
  description: 'Remove entities and their relations from the knowledge graph. Cascading deletion of associated relations. Silent operation if entity does not exist.',
  inputSchema: {
    type: 'object',
    properties: {
      entityNames: {
        type: 'array',
        items: { type: 'string' },
        description: 'Names of entities to delete',
      },
    },
    required: ['entityNames'],
  },
};

export const deleteObservationsTool = {
  name: 'memory_delete_observations',
  description: 'Remove specific observations from entities. Silent operation if observation does not exist.',
  inputSchema: {
    type: 'object',
    properties: {
      deletions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            entityName: { type: 'string', description: 'Target entity name' },
            observations: { type: 'array', items: { type: 'string' }, description: 'Observations to remove' },
          },
          required: ['entityName', 'observations'],
        },
      },
    },
    required: ['deletions'],
  },
};

export const deleteRelationsTool = {
  name: 'memory_delete_relations',
  description: 'Remove specific relations from the graph. Silent operation if relation does not exist.',
  inputSchema: {
    type: 'object',
    properties: {
      relations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            from: { type: 'string', description: 'Source entity name' },
            to: { type: 'string', description: 'Target entity name' },
            relationType: { type: 'string', description: 'Relationship type' },
          },
          required: ['from', 'to', 'relationType'],
        },
      },
    },
    required: ['relations'],
  },
};

export const readGraphTool = {
  name: 'memory_read_graph',
  description: 'Read the entire knowledge graph. Returns complete graph structure with all entities and relations.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export const searchNodesTool = {
  name: 'memory_search_nodes',
  description: 'Search for nodes based on query. Searches across entity names, entity types, and observation content. Returns matching entities and their relations.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query string' },
    },
    required: ['query'],
  },
};

export const openNodesTool = {
  name: 'memory_open_nodes',
  description: 'Retrieve specific nodes by name. Returns requested entities and relations between them. Silently skips non-existent nodes.',
  inputSchema: {
    type: 'object',
    properties: {
      names: {
        type: 'array',
        items: { type: 'string' },
        description: 'Names of entities to retrieve',
      },
    },
    required: ['names'],
  },
};

// Tool Handlers
export async function handleCreateEntities(args) {
  await memoryStore.init();
  const created = memoryStore.createEntities(args.entities);
  await memoryStore.save();
  return {
    content: [
      {
        type: 'text',
        text: `Created ${created.length} entities:\n${JSON.stringify(created, null, 2)}`,
      },
    ],
  };
}

export async function handleCreateRelations(args) {
  await memoryStore.init();
  const created = memoryStore.createRelations(args.relations);
  await memoryStore.save();
  return {
    content: [
      {
        type: 'text',
        text: `Created ${created.length} relations:\n${JSON.stringify(created, null, 2)}`,
      },
    ],
  };
}

export async function handleAddObservations(args) {
  await memoryStore.init();
  const added = memoryStore.addObservations(args.observations);
  await memoryStore.save();
  return {
    content: [
      {
        type: 'text',
        text: `Added observations:\n${JSON.stringify(added, null, 2)}`,
      },
    ],
  };
}

export async function handleDeleteEntities(args) {
  await memoryStore.init();
  const count = args.entityNames.length;
  memoryStore.deleteEntities(args.entityNames);
  await memoryStore.save();
  return {
    content: [
      {
        type: 'text',
        text: `Deleted ${count} entities and their associated relations.`,
      },
    ],
  };
}

export async function handleDeleteObservations(args) {
  await memoryStore.init();
  memoryStore.deleteObservations(args.deletions);
  await memoryStore.save();
  return {
    content: [
      {
        type: 'text',
        text: `Deleted specified observations from ${args.deletions.length} entities.`,
      },
    ],
  };
}

export async function handleDeleteRelations(args) {
  await memoryStore.init();
  memoryStore.deleteRelations(args.relations);
  await memoryStore.save();
  return {
    content: [
      {
        type: 'text',
        text: `Deleted ${args.relations.length} relations.`,
      },
    ],
  };
}

export async function handleReadGraph() {
  await memoryStore.init();
  const graph = memoryStore.getFullGraph();
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(graph, null, 2),
      },
    ],
  };
}

export async function handleSearchNodes(args) {
  await memoryStore.init();
  const matching = memoryStore.searchNodes(args.query);
  const entityNames = matching.map(e => e.name);
  const relations = memoryStore.getRelationsForEntities(entityNames);
  
  return {
    content: [
      {
        type: 'text',
        text: `Found ${matching.length} matching entities:\n${JSON.stringify({ entities: matching, relations }, null, 2)}`,
      },
    ],
  };
}

export async function handleOpenNodes(args) {
  await memoryStore.init();
  const graph = memoryStore.getGraphForEntities(args.names);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(graph, null, 2),
      },
    ],
  };
}
