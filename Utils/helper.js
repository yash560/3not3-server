/* eslint-disable no-underscore-dangle */
const Group = require('../models/group.schema');

// eslint-disable-next-line import/prefer-default-export
const getPublicId = (url) => {
  let publicId = url.substring(url.lastIndexOf('/') + 1);
  publicId = publicId.slice(0, publicId.indexOf('.'));
  return publicId;
};

const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

const filterByScore = (groups, topTeams) => {
  const newTeam = [];
  groups.forEach(async (group) => {
    // push top n teams in group to current round
    for (let i = 0; i < topTeams; i += 1) {
      newTeam.push(group.teams[i]);
    }
  });
};

const filterByQualified = (groups) => {
  const newTeam = [];
  groups.forEach(async (group) => {
    // push top n teams in group to current round
    const tempTeams = group.teams.filter((team) => team.qualified);
    // add tempTeams to newTeam array
    newTeam.push(...tempTeams);
  });
  return newTeam;
};

const generateGroupsFromTeams = (teams, teamsPerGroup, roundNumber) => {
  const groups = [];
  let tempGroup = {};
  // generate groups
  for (let i = 0; i < teams.length; i += 1) {
    if (i % teamsPerGroup === 0) {
      tempGroup = {
        teams: [],
        roundNumber,
        groupNumber: i === 0 ? 1 : i / teamsPerGroup + 1,
      };
      groups.push(tempGroup);
    }
    tempGroup.teams.push({
      team: teams[i]._id,
      slot: tempGroup.teams.length + 1,
    });
  }

  const newGroups = [];

  // generate group objects
  groups.forEach((group) => {
    const grp = new Group(group);
    newGroups.push(grp);
    grp.save();
  });

  return newGroups;
};

module.exports = {
  getPublicId,
  shuffleArray,
  filterByScore,
  filterByQualified,
  generateGroupsFromTeams,
};
