import express from 'express';
import Station from '../models/Station.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', async (req, res) => {
  const { from, to } = req.query;
  console.log(`[ShortestPath] Request from ${from} to ${to}`);

  if (!from || !to) {
    console.log('[ShortestPath] Missing parameters');
    return res.status(400).json({
      success: false,
      error: 'Both from and to station IDs are required',
      example: '/api/shortest-path?from=station1&to=station2'
    });
  }

  try {
    console.log('[ShortestPath] Fetching stations from DB');
    const stations = await Station.find({})
      .populate('connections.station', '_id name coordinates');
    
    if (!stations.length) {
      console.log('[ShortestPath] No stations found in database');
      return res.status(404).json({
        success: false,
        error: 'No stations found in database'
      });
    }

    console.log('[ShortestPath] Building graph structure');
    const graph = {};
    const stationMap = {};
    
    stations.forEach(station => {
      const stationId = station._id.toString();
      stationMap[stationId] = station;
      stationMap[station._id] = station;
      
      graph[stationId] = station.connections.map(conn => ({
        stationId: conn.station._id.toString(),
        distance: conn.distance,
        cost: conn.cost
      }));
    });

    if (!stationMap[from] || !stationMap[to]) {
      console.log('[ShortestPath] Invalid station IDs', {
        fromExists: !!stationMap[from],
        toExists: !!stationMap[to]
      });
      
      return res.status(404).json({
        success: false,
        error: 'One or both station IDs not found',
        availableStations: stations.slice(0, 10).map(s => ({
          id: s._id,
          name: s.name
        }))
      });
    }

    console.log('[ShortestPath] Calculating shortest path');
    const distances = {};
    const costs = {};
    const previous = {};
    const visited = new Set();
    const unvisited = new Set(Object.keys(graph));

    Object.keys(graph).forEach(id => {
      distances[id] = Infinity;
      costs[id] = Infinity;
      previous[id] = null;
    });
    
    distances[from] = 0;
    costs[from] = 0;

    while (unvisited.size > 0) {
      let current = null;
      let smallestDistance = Infinity;
      
      for (const node of unvisited) {
        if (distances[node] < smallestDistance) {
          smallestDistance = distances[node];
          current = node;
        }
      }

      if (current === to || current === null) break;
      unvisited.delete(current);
      visited.add(current);

      for (const neighbor of graph[current]) {
        if (visited.has(neighbor.stationId)) continue;
        
        const altDistance = distances[current] + neighbor.distance;
        const altCost = costs[current] + neighbor.cost;
        
        if (altDistance < distances[neighbor.stationId]) {
          distances[neighbor.stationId] = altDistance;
          costs[neighbor.stationId] = altCost;
          previous[neighbor.stationId] = current;
        }
      }
    }

    const pathIds = [];
    let current = to.toString();
    
    while (current !== null) {
      pathIds.unshift(current);
      current = previous[current];
    }

    if (distances[to] === Infinity) {
      console.log('[ShortestPath] No path exists between stations');
      return res.status(404).json({
        success: false,
        error: 'No path exists between these stations',
        possibleReasons: [
          'Stations are in disconnected networks',
          'All connections are one-way in the wrong direction'
        ]
      });
    }

    const pathDetails = pathIds.map(id => {
      const station = stationMap[id];
      return {
        id: station._id,
        name: station.name,
        coordinates: station.coordinates
      };
    });

    console.log('[ShortestPath] Path found:', {
      steps: pathIds.length - 1,
      distance: distances[to],
      cost: costs[to]
    });

    res.json({
      success: true,
      path: pathIds,
      pathDetails,
      totalDistance: distances[to],
      totalCost: costs[to],
      steps: pathIds.length - 1
    });

  } catch (error) {
    console.error('[ShortestPath] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;