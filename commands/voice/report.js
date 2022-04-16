const { MessageActionRow, MessageSelectMenu } = require('discord.js');

module.exports = {
    name: "report",
    description: "Report a user in your current voice channel.",
    voiceOnly: true,
    tempOnly: true,
    run: async(interaction) => {
        // get all members in voice channel
        const allMembersInVoice = interaction.member.voice.channel.members.filter(r => !r.user.bot);

        // check if no member in voice channel, other than user himself
        if (allMembersInVoice.size === 1) {
            return interaction.reply({
                content: ":x: There is no one in your voice channel.",
                ephemeral: true
            })
        }

        // empty array to assign latter with label and value
        const usersArray = [];
        
        // map all users in current voice channel and add option for them
        allMembersInVoice.map((member) => {
            // filter interaction author
            if (member.id === interaction.user.id) return;
            usersArray.push({
                label: member.user.tag,
                value: member.id,
                emoji: "🔨"
            });
        });

        // create a row with select menu component
        const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
            .setCustomId('report_users')
            .setPlaceholder('Choose a user')
            .addOptions(usersArray)
        )
        
        // Reply to interaction
        interaction.reply({
            content: "**Please select a user to report**",
            components: [row],
            ephemeral: true
        });
    }
}