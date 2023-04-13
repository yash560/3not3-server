const httpStatus = require('http-status');
const logger = require('@logger');
const {
  filterByScore,
  filterByQualified,
  shuffleArray,
  generateGroupsFromTeams,
} = require('../Utils/helper');
const Tournament = require('../models/tournament.schema');

const createRounds = (req, res) => {
  // Find Tourney Separately
  const { tournament, body } = req;
  const { name, teamsPerGroup, matchesPerGroup } = body;
  const totalRounds = tournament.rounds.length;

  logger.debug(
    `Creating round number ${totalRounds + 1} with name ${name} for ${
      tournament.name
    }`
  );

  const round = {
    roundNumber: totalRounds + 1,
    name,
    teamsPerGroup,
    matchesPerGroup,
    groups: [],
  };

  logger.debug(`Round created: ${JSON.stringify(round)}`);

  // Push new round to tournament model
  tournament.rounds.push(round);

  // if (totalRounds !== 0) {
  //   const prevRound = tournament.rounds[totalRounds - 1];
  //   // Take out top teams
  //   const newTeams = [];
  //   prevRound.groups.forEach((group) => {
  //     for (let i = 0; i < prevRound.teamsToQualify; i += 1) {
  //       newTeams.push(group.teams[i]);
  //     }
  //   });
  //   round.teams = newTeams;
  //   tournament.rounds.push(round);
  // }

  // if (totalRounds === 0) {
  //   round.teams = shuffleArray(teams);
  //   tournament.rounds.push(round);
  // }

  // save tournament
  tournament.save((err, doc) => {
    if (err) {
      logger.error(err);
      return res
        .status(httpStatus[400])
        .json({ success: false, message: 'Unexpected Error' });
    }
    res.status(200).json({
      success: true,
      message: 'Round created successfully',
      data: doc,
    });
  });
};

const generateGroups = async (req, res) => {
  const {
    tournament,
    tournament: { rounds },
  } = req;

  const { fromQualified, fromScores, topTeams, teamsPerGroup, shuffle } =
    req.body;
  const { roundNumber } = req.params;

  let currentRound = {};
  let prevRound = {};
  let newTeams = [];
  logger.debug(
    'Starting to generate groups ----------------------------------'
  );
  logger.debug(`Generating groups for round ${roundNumber}`);

  if (rounds.length === 0 && roundNumber === 1) {
    logger.debug('Generating groups for first round');
    newTeams = tournament.teams;
  } else {
    currentRound = rounds[roundNumber - 1];
    prevRound = rounds[roundNumber - 2];
  }

  if (fromScores && rounds.length > 1) {
    logger.debug('Generating groups from scores');
    newTeams = await filterByScore(prevRound.groups, topTeams);
  }

  if (fromQualified && rounds.length > 1) {
    logger.debug('Generating groups from qualified teams');
    newTeams = await filterByQualified(prevRound.groups);
  }

  if (shuffle) {
    logger.debug('Shuffling teams');
    newTeams = shuffleArray(newTeams);
  }

  // Generate groups from newTeams array and teamsPerGroup
  logger.debug(`Generating groups from ${tournament.teams.length} teams`);
  const newGroups = generateGroupsFromTeams(
    newTeams,
    teamsPerGroup,
    roundNumber
  );

  currentRound.groups = newGroups;

  // Save new genereated round to tournament model
  tournament.rounds[roundNumber - 1] = currentRound;

  // res.status(200).json(currentRound);

  // save tournament
  tournament.save((err, doc) => {
    if (err) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: 'Unexpected Error' });
    }
    res.status(200).json({
      success: true,
      message: 'Groups created successfully',
      data: doc,
    });
  });
};

const getGroupsByRoundNumber = async (req, res) => {
  try {
    const { roundNumber, tourneyId } = req.params;
    // Find tournament by id and puplotae all groups of first round
    const tournament = await Tournament.findById(tourneyId)
      .select('rounds')
      .populate({
        path: 'rounds',
        match: { roundNumber },
        populate: {
          path: 'groups',
          match: { roundNumber },
          model: 'Group',
          populate: {
            path: 'teams.team',
            model: 'Team',
          },
        },
      });

    // const { groups } = tournament.rounds.find(
    //   (round) => round.roundNumber === parseInt(roundNumber, 10)
    // );
    res.status(200).json({ success: true, data: tournament });
  } catch (error) {
    // eslint-disable-next-line prettier/prettier
    logger.error(
      `Error while fetching groups of round ${req.params.roundNumber} of tournamentId ${req.params.tourneyId} | `,
      error
    );
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRounds,
  generateGroups,
  getGroupsByRoundNumber,
};
