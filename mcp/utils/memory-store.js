import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEMORY_FILE = path.resolve(__dirname, '..', '..', 'src', 'data', 'memory.json');

class MemoryStore {
  constructor() {
    this.entities = new Map();
    this.relations = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      const data = await fs.readFile(MEMORY_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      this.entities = new Map(Object.entries(parsed.entities || {}));
      this.relations = parsed.relations || [];
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.entities = new Map();
        this.relations = [];
        await this.save();
      } else {
        throw error;
      }
    }
    this.initialized = true;
  }

  async save() {
    const data = {
      entities: Object.fromEntries(this.entities),
      relations: this.relations,
    };
    await fs.mkdir(path.dirname(MEMORY_FILE), { recursive: true });
    await fs.writeFile(MEMORY_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Entities
  createEntities(entities) {
    const created = [];
    for (const entity of entities) {
      if (this.entities.has(entity.name)) continue;
      
      const newEntity = {
        name: entity.name,
        entityType: entity.entityType,
        observations: entity.observations || [],
      };
      this.entities.set(entity.name, newEntity);
      created.push(newEntity);
    }
    return created;
  }

  deleteEntities(entityNames) {
    for (const name of entityNames) {
      this.entities.delete(name);
    }
    // Remove orphaned relations
    this.relations = this.relations.filter(
      r => !entityNames.includes(r.from) && !entityNames.includes(r.to)
    );
  }

  getEntity(name) {
    return this.entities.get(name);
  }

  getAllEntities() {
    return Array.from(this.entities.values());
  }

  // Relations
  createRelations(relations) {
    const created = [];
    for (const relation of relations) {
      // Check both entities exist
      if (!this.entities.has(relation.from) || !this.entities.has(relation.to)) {
        continue;
      }
      
      // Check for duplicates
      const exists = this.relations.some(
        r => r.from === relation.from && 
             r.to === relation.to && 
             r.relationType === relation.relationType
      );
      if (exists) continue;

      this.relations.push(relation);
      created.push(relation);
    }
    return created;
  }

  deleteRelations(relations) {
    for (const relation of relations) {
      const idx = this.relations.findIndex(
        r => r.from === relation.from && 
             r.to === relation.to && 
             r.relationType === relation.relationType
      );
      if (idx !== -1) {
        this.relations.splice(idx, 1);
      }
    }
  }

  getRelationsForEntities(entityNames) {
    const nameSet = new Set(entityNames);
    return this.relations.filter(
      r => nameSet.has(r.from) && nameSet.has(r.to)
    );
  }

  // Observations
  addObservations(observations) {
    const added = [];
    for (const obs of observations) {
      const entity = this.entities.get(obs.entityName);
      if (!entity) {
        throw new Error(`Entity not found: ${obs.entityName}`);
      }
      
      const newObservations = [];
      for (const content of obs.contents) {
        if (!entity.observations.includes(content)) {
          entity.observations.push(content);
          newObservations.push(content);
        }
      }
      added.push({
        entityName: obs.entityName,
        addedObservations: newObservations,
      });
    }
    return added;
  }

  deleteObservations(deletions) {
    for (const deletion of deletions) {
      const entity = this.entities.get(deletion.entityName);
      if (!entity) continue;
      
      entity.observations = entity.observations.filter(
        obs => !deletion.observations.includes(obs)
      );
    }
  }

  // Search
  searchNodes(query) {
    const lowerQuery = query.toLowerCase();
    const matching = [];
    
    for (const entity of this.entities.values()) {
      const nameMatch = entity.name.toLowerCase().includes(lowerQuery);
      const typeMatch = entity.entityType.toLowerCase().includes(lowerQuery);
      const obsMatch = entity.observations.some(
        obs => obs.toLowerCase().includes(lowerQuery)
      );
      
      if (nameMatch || typeMatch || obsMatch) {
        matching.push(entity);
      }
    }
    
    return matching;
  }

  // Get graph for specific entities
  getGraphForEntities(entityNames) {
    const entities = [];
    for (const name of entityNames) {
      const entity = this.entities.get(name);
      if (entity) entities.push(entity);
    }
    
    const relations = this.getRelationsForEntities(entityNames);
    return { entities, relations };
  }

  // Read full graph
  getFullGraph() {
    return {
      entities: this.getAllEntities(),
      relations: this.relations,
    };
  }
}

export const memoryStore = new MemoryStore();
