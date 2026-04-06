# MCP Knowledge Graph Memory Server

Local knowledge graph memory implementation for Claude using the Model Context Protocol (MCP). This server enables persistent memory across conversations by storing entities, relations, and observations in a local JSON file.

## Quick Start

The memory server is included in the `mccal-media` MCP server at `mcp/server.js`.

### Windsurf Configuration

Already configured in `.windsurf/mcp-config.json`:

```json
{
  "mcpServers": {
    "mccal-media": {
      "command": "node",
      "args": ["mcp/server.js"],
      "cwd": "i:/Programing/Projects/McCals-Website"
    }
  }
}
```

### Memory File Location

Data persists to: `src/data/memory.json`

## Core Concepts

### Entities
Primary nodes in the knowledge graph with:
- **name** (string): Unique identifier
- **entityType** (string): Classification (person, organization, event, etc.)
- **observations** (string[]): Associated facts

```json
{
  "name": "John_Smith",
  "entityType": "person",
  "observations": ["Speaks fluent Spanish"]
}
```

### Relations
Directed connections between entities stored in active voice:

```json
{
  "from": "John_Smith",
  "to": "Anthropic",
  "relationType": "works_at"
}
```

### Observations
Atomic facts attached to entities:

```json
{
  "entityName": "John_Smith",
  "observations": [
    "Speaks fluent Spanish",
    "Graduated in 2019"
  ]
}
```

## Available Tools

| Tool | Purpose |
|------|---------|
| `memory_create_entities` | Create entities (skips if name exists) |
| `memory_create_relations` | Create relations between entities (skips duplicates) |
| `memory_add_observations` | Add facts to existing entities |
| `memory_delete_entities` | Remove entities + cascade relations |
| `memory_delete_observations` | Remove specific observations (silent if missing) |
| `memory_delete_relations` | Remove specific relations (silent if missing) |
| `memory_read_graph` | Read entire knowledge graph |
| `memory_search_nodes` | Search names, types, observations |
| `memory_open_nodes` | Get specific entities + their relations |

## Usage Examples

### Remember a person
```
Create entity: name="Jane_Doe", type="person", observations=["Photographer", "Based in NYC"]
```

### Connect entities
```
Create relation: from="Jane_Doe", to="McCal_Media", relationType="works_with"
```

### Search memories
```
Search nodes: query="photographer"
```

## System Prompt Template

Add to project instructions for personalized memory:

```
Follow these steps for each interaction:

1. Memory Retrieval:
   - Begin by saying "Remembering..." and retrieve all relevant information
   - Refer to your knowledge graph as your "memory"

2. Memory Capture:
   - Watch for new information in these categories:
     a) Basic Identity (role, location, expertise)
     b) Behaviors (interests, habits)
     c) Preferences (communication style)
     d) Goals (project aims)
     e) Relationships (connections, collaborations)

3. Memory Update:
   - Create entities for people, organizations, projects
   - Connect them with relations
   - Store facts as observations
```

## Implementation Details

- **Storage**: `mcp/utils/memory-store.js` - Map-based in-memory storage with JSON persistence
- **Tools**: `mcp/tools/memory.js` - 9 tool definitions and handlers
- **Server**: `mcp/server.js` - Integrated with existing mccal-media MCP server

## See Also

- [MCP Protocol Reference](https://modelcontextprotocol.io)
- [Memory Server Source](https://github.com/modelcontextprotocol/servers/tree/main/src/memory)
