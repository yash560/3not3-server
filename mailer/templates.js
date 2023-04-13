const inviteToTeam = {
  personalizations: [
    {
      dynamic_template_data: {
        teamCode: '$ 239.85',
      },
    },
  ],
  templateId: 'd-ed4cbf6409e84e128457cd4b05794d97',
};
const verifyemail = {
  personalizations: {
    dynamic_template_data: {
      email: '',
    },
  },
  templateId: 'ss',
};

module.exports = {
  inviteToTeam,
  verifyemail,
};
