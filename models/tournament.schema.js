/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const game = [
  'Valorant',
  'BGMI',
  'PUBG',
  'Call Of Duty Mobile',
  'Clash Of Clans',
  'FreeFire',
];

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    organiser: { type: String },
    thumbnail: { type: String },
    banner: { type: String },
    gameName: { type: String, required: true, enum: game },
    gameMode: { type: String, required: true },
    featured: { type: Boolean, default: false },
    paid: { type: Boolean, required: true },
    entryFee: { type: Number },
    description: { type: String },
    rules: { type: String },
    maximumTeams: { type: Number, required: true },
    membersPerTeam: { type: Number },
    prizes: { type: String },
    isDeleted: { type: Boolean, default: false },
    region: {
      type: String,
      enum: ['Asia', 'Europe', 'North America', 'South America', 'Africa'],
    },
    timezone: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
    teams: [{ type: ObjectId, ref: 'Team' }],
    bracketType: {
      type: String,
      enum: ['singleElimination', 'doubleElimination', 'roundRobin'],
      default: 'singleElimination',
    },
    bracket: { type: ObjectId, ref: 'Bracket' },
    tags: [{ type: String, description: 'comma separeted' }],
    isPublic: { type: Boolean, default: false },
    registration: { type: Boolean, default: false },
    status: {
      type: String,
      default: 'upcoming',
      enum: ['upcoming', 'started', 'inprogress', 'completed'],
    },
    rounds: [
      {
        roundNumber: Number,
        name: String,
        teamsPerGroup: Number,
        teamsToQualify: Number,
        teams: [{ type: ObjectId, ref: 'Team' }],
        groups: [{ type: ObjectId, ref: 'Group' }],
      },
    ],
  },
  { timestamps: true }
);

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;
