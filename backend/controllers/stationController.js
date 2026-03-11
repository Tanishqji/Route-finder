import Station from '../models/Station.js';

export const getStations = async (req, res) => {
  try {
    const stations = await Station.find().populate('connections.station');
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get stations', error });
  }
};

export const createStation = async (req, res) => {
  try {
    const { name } = req.body;
    const newStation = new Station({ name, connections: [] });
    await newStation.save();
    res.status(201).json(newStation);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create station', error });
  }
};

export const connectStations = async (req, res) => {
  try {
    const { stationId1, stationId2, distance, cost } = req.body;

    const station1 = await Station.findById(stationId1);
    const station2 = await Station.findById(stationId2);

    if (!station1 || !station2) {
      return res.status(404).json({ message: 'One or both stations not found' });
    }

    station1.connections.push({
      station: station2._id,
      distance,
      cost,
    });

    station2.connections.push({
      station: station1._id,
      distance,
      cost,
    });

    await station1.save();
    await station2.save();

    res.status(200).json({ message: 'Stations connected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to connect stations', error });
  }
};
