const mongoose = require('mongoose');
const { BracketsManager } = require('brackets-manager');
const { InMemoryDatabase } = require('brackets-memory-db');

const { ObjectId } = mongoose.Schema.Types;
// const Tournament = require('../models/tournament.model');
const logger = require('@logger');

const bracketSchema = new mongoose.Schema({
  participant: [
    {
      id: Number,
      tournament_id: Number,
      name: String,
      teamId: { type: ObjectId, ref: 'Team' },
    },
  ],
  stage: Array,
  group: Array,
  round: Array,
  match: [
    {
      id: Number,
      number: Number,
      stage_id: Number,
      group_id: Number,
      round_id: Number,
      child_count: Number,
      status: Number,
      locked: Boolean,
      opponent1: Object,
      opponent2: Object,
      extras: {
        proof1: String,
        proof2: String,
        map: String,
        mode: String,
        mapVeto: String,
        roomId: String,
        roomPass: String,
        startTime: String,
        note: String,
        datetime: String,
        streamLink: String,
      },
      chats: [],
    },
  ],
  match_game: Array,
});

bracketSchema.statics.createBracket = async (stage) => {
  const storage = new InMemoryDatabase();
  const bracket = new BracketsManager(storage);
  logger.info('Creating bracket for stage');
  await bracket.create(stage);
  return bracket.storage.data;
};

// Update bracket
bracketSchema.statics.updateMatch = async (bracket, matchId, updates) => {
  try {
    const storage = new InMemoryDatabase();
    const bracketManager = new BracketsManager(storage);
    bracketManager.storage.data = bracket;

    /**
     * {
     * opponent1: { forfeit: true },
     * opponent1: {
     * score, result,
     * },
     * opponent2: {
     * score, result,
     * },
     * }
     */
    let update = updates;
    update.id = matchId;
    await bracketManager.update.match(update);
    return bracketManager.storage.data;
  } catch (error) {
    logger.error(error);
  }
};

const Bracket = mongoose.model('Bracket', bracketSchema);

module.exports = Bracket;
