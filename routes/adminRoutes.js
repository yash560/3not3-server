/* eslint-disable no-underscore-dangle */
const router = require('express').Router();
const logger = require('@logger');
const User = require('../models/user.schema');
const Team = require('../models/team.schema');
const Tournament = require('../models/tournament.schema');
const Group = require('../models/group.schema');

/**
 * Get All Users
 * @api {get} /api/x/all-users
 * @middleware {function} authorizedUser, authAdmin
 */
router.get('/all-users', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, users });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Get All Teams
 * @api {get} /api/x/all-teams
 * @middleware {function} authorizedUser, authAdmin
 */
router.get('/all-teams', async (req, res) => {
  try {
    const teams = await Team.find({});
    res.status(200).json({ success: true, teams });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Get All Tournaments
 * @api {get} /api/x/all-tournaments
 * @middleware {function} authorizedUser, authAdmin
 */
router.get('/all-tournaments', async (req, res) => {
  try {
    const tournaments = await Tournament.find({});
    res.status(200).json({ success: true, tournaments });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Search a Team by name
 * @api {get} /api/x/team/:name
 * @middleware {function} authorizedUser, authAdmin
 */
router.get('/team/:name', async (req, res) => {
  try {
    const teams = await Team.find({
      name: { $regex: req.params.name, $options: 'si' },
    });
    res.status(200).json({ success: true, teams });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Search a Tournament by name
 * @api {get} /api/x/tournament/:name
 * @middleware {function} authorizedUser, authAdmin
 */
router.get('/tournament/:name', async (req, res) => {
  try {
    const tournaments = await Tournament.find({
      name: { $regex: req.params.name, $options: 'si' },
    });
    // .populate('teams');
    res.status(200).json({ success: true, tournaments });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Search a User by name
 * @api {get} /api/x/user/:name
 * @middleware {function} authorizedUser, authAdmin
 */
router.get('/user/:name', async (req, res) => {
  try {
    const users = await User.find({
      username: { $regex: req.params.name, $options: 'si' },
    });
    res.status(200).json({ success: true, users });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Change user type
 * @api {post} /api/x/change-user-type/:userId
 * @middleware {function} authorizedUser, authAdmin
 */
router.post('/change-user-type/:userId', async (req, res) => {
  try {
    const { userType } = req.body;
    if (!userType) {
      throw new Error('Missing user type');
    }

    const user = await User.findById(req.params.userId);
    user.userType = userType;
    await user.save();
    logger.info(`[ADMIN] User ${user.username} changed to ${userType}`);

    res
      .status(200)
      .json({ success: true, message: 'User role changed!!', user });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Get all teams of a tournament
 * @api {get} /api/x/tournament/:tournamentId/teams
 * @middleware {function} authorizedUser, authAdmin
 */
router.get('/tournament/:tournamentId/teams', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);
    const teams = await Team.find({
      _id: { $in: tournament.teams },
    });
    res.status(200).json({ success: true, teams });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Get all rounds of a tournament
 * @api {get} /api/x/tournament/:tournamentId/rounds
 * @middleware {function} authorizedUser, authAdmin
 */
router.get('/tournament/:tournamentId/rounds', async (req, res) => {
  try {
    const rounds = await Tournament.findById(req.params.tournamentId).select(
      'rounds'
    );
    res.status(200).json({ success: true, rounds });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Add a team to a tournament
 * @api {post} /api/x/tournament/:tournamentId/add-team
 */
router.post('/tournament/:tournamentId/add-team', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { teamId } = req.body;
    const tournament = await Tournament.findById(tournamentId);
    const { teams } = tournament;
    const team = await Team.findById(teamId);

    if (teams.includes(teamId)) {
      res.status(200).json({ success: false, message: 'Team already added' });
    } else {
      // tournament
      teams.push(teamId);
      tournament.teams = teams;
      await tournament.save();
      logger.info(
        `[ADMIN] Team "${team.name}" added to tournament "${tournament.name}"`
      );

      // user
      if (team.members) {
        team.members.forEach(async (member) => {
          const user = await User.findById(member.member);
          const userTournaments = user.tournaments;
          userTournaments.push(tournamentId);
          user.tournaments = userTournaments;
          await user.save();
          logger.info(
            `[ADMIN] User "${user.username}" added to tournament "${tournament.name}"`
          );
        });
      }

      res.status(200).json({ success: true, message: 'Team added' });
    }
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Remove a team from a tournament
 * @api {post} /api/x/tournament/:tournamentId/remove-team
 */
router.post('/tournament/:tournamentId/remove-team', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { teamId } = req.body;
    const tournament = await Tournament.findById(tournamentId);
    const { teams } = tournament;
    const team = await Team.findById(teamId);

    if (!teams.includes(teamId)) {
      res.status(200).json({ success: false, message: 'Team not added' });
    } else {
      // tournament
      teams.splice(teams.indexOf(teamId), 1);
      tournament.teams = teams;
      await tournament.save();
      logger.info(
        `[ADMIN] Team "${team.name}" removed from tournament "${tournament.name}"`
      );

      // user
      if (team.members) {
        team.members.forEach(async (member) => {
          const user = await User.findById(member.member);
          const userTournaments = user.tournaments;
          userTournaments.splice(userTournaments.indexOf(tournamentId), 1);
          user.tournaments = userTournaments;
          await user.save();
          logger.info(
            `[ADMIN] User "${user.username}" removed from tournament "${tournament.name}"`
          );
        });
      }

      res.status(200).json({ success: true, message: 'Team removed' });
    }
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Get all groups from a round
 * @api {get} /api/x/tournament/:tournamentId/:roundNo/groups
 */
router.get('/tournament/:tournamentId/:roundNo/groups', async (req, res) => {
  try {
    const { tournamentId, roundNo } = req.params;
    const rounds = await Tournament.findById(tournamentId).select('rounds');
    const round = rounds.rounds.find((r) => r.roundNumber === roundNo);

    if (!round) {
      res.status(200).json({ success: false, message: 'Round not found' });
    } else {
      const groups = await Group.find({
        _id: { $in: round.groups },
      });
      res.status(200).json({ success: true, groups });
    }
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Update group startTime, endTime and Mode
 * @api {post} /api/x/tournament/:tournamentId/:roundNo/update-group-time
 */
router.post(
  '/tournament/:tournamentId/:roundNo/update-group-time',
  async (req, res) => {
    try {
      const { tournamentId, roundNo } = req.params;
      const { groupId, startTime, endTime, mode } = req.body;
      const rounds = await Tournament.findById(tournamentId).select('rounds');
      const round = rounds.find((r) => r.roundNumber === roundNo);

      if (!round) {
        res.status(200).json({ success: false, message: 'Round not found' });
      } else {
        const group = await Group.findById(groupId);
        if (!group) {
          res.status(200).json({ success: false, message: 'Group not found' });
        } else {
          if (startTime) group.startTime = startTime;
          if (endTime) group.endTime = endTime;
          if (mode) group.mode = mode;

          await group.save();
          res.status(200).json({ success: true, message: 'Group updated' });
        }
      }
    } catch (err) {
      logger.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

/**
 * Update group Room information
 * @api {post} /api/x/tournament/:tournamentId/:roundNo/update-group-room
 */
router.post(
  '/tournament/:tournamentId/:roundNo/update-group-room',
  async (req, res) => {
    try {
      const { tournamentId, roundNo } = req.params;
      const { groupId, roomId, roomPass, streamLink } = req.body;
      const rounds = await Tournament.findById(tournamentId).select('rounds');
      const round = rounds.find((r) => r.roundNumber === roundNo);

      if (!round) {
        res.status(200).json({ success: false, message: 'Round not found' });
      } else {
        const group = await Group.findById(groupId);
        if (!group) {
          res.status(200).json({ success: false, message: 'Group not found' });
        } else {
          if (roomId) group.roomId = roomId;
          if (roomPass) group.roomPass = roomPass;
          if (streamLink) group.streamLink = streamLink;

          await group.save();
          res.status(200).json({ success: true, message: 'Group updated' });
        }
      }
    } catch (err) {
      logger.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
