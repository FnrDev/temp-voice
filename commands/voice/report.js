const { report_channel_id } = require('../../settings.json');

module.exports = {
    name: "report",
    description: "Report a user in your current voice channel.",
    options: [
        {
            name: "user",
            description: "The user to report.",
            type: 6,
            required: true
        },
        {
            name: "reason",
            description: "The reason of report.",
            type: 3,
            required: true
        },
        {
            name: "attachment",
            description: "The attachment for report",
            type: 11
        }
    ],
    voiceOnly: true,
    tempOnly: true,
    run: async(interaction) => {
        // get options
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const attachment = interaction.options.getAttachment('attachment');

        console.log(attachment)

        // check if user id is not command author
        if (user.id === interaction.user.id) {
            return interaction.reply({
                content: ':x: You can\'t report yourself!',
                ephemeral: true
            })
        }

        // check if reported user is bot
        if (user.bot) {
            return interaction.reply({
                content: '🤖 I can\'t take this action on bots.',
                ephemeral: true
            })
        }

        // check if attachment is image
        if (attachment && !attachment.contentType.startsWith('image')) {
            return interaction.reply({
                content: ':x: Attachment must be an image.',
                ephemeral: true
            })
        }

        // check if user in voice channel
        const isInVoice = interaction.member.voice.channel.members.get(user.id);
        if (!isInVoice) {
            return interaction.reply({
                content: ':x: Member is not in your voice channel',
                ephemeral: true
            })
        }

        // cache report channel
        const channel = interaction.guild.channels.cache.get(report_channel_id);
        if (!channel) {
            return interaction.reply({
                content: ':x: Report channel is not exists, please report this issue to developers of this bot.',
                ephemeral: true
            })
        }

        channel.send({
            content: `**New report from ${interaction.user} (\`${interaction.user.id}\`)**\n\n**Reported user:** ${user} (\`${user.id}\`)\n**Reason of report:** ${reason}`,
            files: attachment ? [attachment.url] : null
        });

        interaction.reply({
            content: "✅ Your report has been sent to moderators"
        })
    }
}