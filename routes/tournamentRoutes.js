/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prettier/prettier */
const router = require('express').Router();
const logger = require('@logger');
const random = require('crypto-random-string');
const {
  createTournament,
  updateTournament,
  updateTournamentThumbnailAndBanner,
  getAllTournaments,
  deleteTournament,
  createRounds,
  deleteRound,
  createBracket,
  updateBracketMatch,
  joinTournament,
  unregisterTournament,
} = require('../controllers/tournament.controllers');
const {
  generateGroups,
  getGroupsByRoundNumber,
} = require('../controllers/scheduling.controllers');
// eslint-disable-next-line no-unused-vars
const { authorizedUser, authAdmin } = require('../middlewares/auth');
const Tournament = require('../models/tournament.schema');
const Team = require('../models/team.schema');
const Bracket = require('../models/bracket.schema');

/**
 * Get Tournament Data from tournament Id
 * @api {get} /api/tournaments/:id
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 * @param {String} Id
 */
router.param('tourneyId', (req, res, next, Id) => {
  Tournament.findById(Id)
    .populate('teams')
    .exec((err, doc) => {
      if (err) {
        return res
          .status(404)
          .json({ success: false, message: 'Tournament not found' });
      }
      req.tournament = doc;
      next();
    });
});

/**
 * Get Tournament Data from tournament Id
 * @api {get} /api/tournaments/:id
 * @param {Object} req
 * @param {Object} res
 */
router.get('/getById/:tourneyId', (req, res) => {
  res.status(200).json({ success: true, data: req.tournament });
});

/**
 * Get All Tournaments
 * @api {get} /api/tournaments/getAll
 */
router.get('/getAll', getAllTournaments);

// ----------------------------ADMIN ROUTES------------------------------

/**
 * Create a new tournament
 * @api {post} /api/tournaments/create
 */
router.post('/create', authorizedUser, createTournament);

/**
 * Update Tournament
 * @api {post} /api/tournaments/update/:tourneyId
 */
router.post('/update/:tourneyId', updateTournament);

/*
 * Update Tournament Thumbnail or/and Banner
 * @api {post} /api/tournaments/update/:tourneyId/image
 */
router.post('/update/:tourneyId/image', updateTournamentThumbnailAndBanner);

/**
 * Join a tournament
 * @api {post} /api/tournaments/join/:tourneyId
 */
router.post('/join/:tournamentId', joinTournament);

/**
 * Unregister from tournament
 * @api {post} /api/tournaments/unregister/:tourneyId
 */
router.post('/unregister/:tournamentId', unregisterTournament);

/**
 * Delete a tournament
 * @api {delete} /api/tournaments/:id
 * @param {Object} req
 * @param {Object} res
 */
router.post('/delete', authorizedUser, deleteTournament);

/** BRS SCHEDULING ROUTES ------------------------------ */
/** BRS SCHEDULING ROUTES ------------------------------ */

/**
 * Add a new round to a tournament
 * @api {post} /api/tournaments/:tourneyId/rounds/create
 * @param {Object} req
 * @param {Object} res
 * @bug: new round is not added to the tournament
 */
router.post('/:tourneyId/rounds/create', createRounds);

// Generate Groups
/**
 * Generate Groups
 * @api {post} /api/tournaments/:tourneyId/rounds/:roundNumber/groups/create
 * @param {Object} req
 * @param {Object} res
 */
router.post('/:tourneyId/rounds/:roundNumber/groups/create', generateGroups);

/**
 * delete a round from a tournament
 * @api {delete} /api/tournaments/:tourneyId/rounds/:roundNumber/delete
 * @param {Object} req
 * @param {Object} res
 *
 */
router.post(
  '/:tourneyId/rounds/:roundNumber/delete',
  authorizedUser,
  deleteRound
);

/**
 * Get all groups by round number of a tournament
 * @api {get} /api/tournaments/:tourneyId/rounds/:roundNumber/groups
 * @param {Object} req
 * @param {Object} res
 */
router.get(
  '/:tourneyId/rounds/:roundNumber/groups',
  authorizedUser,
  getGroupsByRoundNumber
);

/**
 * Generate Brackets
 * @api {post} /api/tournaments/:tourneyId/brackets/create
 * @param {Object} req
 * @param {Object} res
 */
router.post('/brackets/create', authorizedUser, createBracket);

/**
 * Get bracket by bracket Id
 * @api {get} /api/tournaments/brackets/:id
 */
router.get('/brackets/:bracketId', (req, res) => {
  const { bracketId } = req.params;
  Bracket.findById(bracketId).exec((err, result) => {
    if (err) res.status(500).json({ success: false, message: err.message });
    else res.status(200).json(result);
  });
});

/**
 * Update Bracket Match Result
 * @api {post} /api/tournaments/brackets/:id/match/update
 * @param {Object} req
 * @param {Object} res
 */
router.post(
  '/brackets/:bracketId/match/update',
  authorizedUser,
  updateBracketMatch
);

/**
 * Get a Group of User in a tournament with TeamId
 * @api {get} /api/tournaments/:tourneyId/groups/:teamId
 */
router.get('/:tourneyId/groups/:teamId', async (req, res) => {
  try {
    const { tourneyId, teamId } = req.params;
    const groups = await Tournament.findById(tourneyId)
      .select('rounds')
      .populate({
        path: 'rounds',
        populate: {
          path: 'groups',
          model: 'Group',
          populate: {
            path: 'teams.team',
            model: 'Team',
          },
        },
      });
    const group = groups.rounds.find((round) =>
      round.groups.find((uGroup) =>
        uGroup.teams.find((team) => team.team._id.toString() === teamId)
      )
    );
    if (!group)
      return res
        .status(404)
        .json({ success: false, message: 'Group not found' });
    const userGroup = group.groups.find((uGroup) =>
      uGroup.teams.find((team) => team.team._id.toString() === teamId)
    );
    if (!userGroup)
      return res
        .status(404)
        .json({ success: false, message: 'Group not found' });
    res.status(200).json({ success: true, data: userGroup });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// eslint-disable-next-line no-unused-vars
const makeBracket = async (req, res) => {
  const data = await Bracket.createBracket({
    name: 'gameezy',
    tournamentId: 0,
    type: 'single_elimination',
    seeding: [
      'Team 1',
      'Team 2',
      'Team 3',
      'Team 4',
      'Team 5',
      'Team 6',
      'Team 7',
      'Team 8',
    ],
  });
  console.log({ data });
};

// makeBracket();

// eslint-disable-next-line no-unused-vars
const addMulti = () => {
  Tournament.findById('61fcf4caed54d33c1a054aff').exec((err, data) => {
    for (let i = 0; i < 60; i += 1) {
      const tm = new Team({
        name: random({ length: 6, type: 'alphanumeric' }),
        gameName: 'PUBG',
        teamCode: random({ length: 6, type: 'alphanumeric' }),
      });
      data.teams.push(tm._id.toString());
      tm.save();
    }
    data.save((er, docs) => {
      if (err) logger.error(er);
      else logger.info(docs);
    });
  });
};

// addMulti();

module.exports = router;
