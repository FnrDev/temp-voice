module.exports = {
    name: "deny",
    description: "Deny user from joining the channel.",
    options: [
        {
            name: "user",
            description: "User to deny from joining the channel.",
            type: 6,
            required: true
        }
    ],
    voiceOnly: true,
    tempOnly: true,
    allowManagers: true,
    run: async(interaction, voiceData, client) => {
        // get member from option
        const member = interaction.options.getMember('user');
        
        // check if member has perms before removing them.
        if (!interaction.member.voice.channel.permissionsFor(member).has('CONNECT')) {
            interaction.reply({
                content: `:x: ${member} already has been denied from joining your channel.`,
                ephemeral: true
            }).catch(console.error);
        }

        // Edit voice channel permission to set "CONNECT" to false
        await interaction.member.voice.channel.permissionOverwrites.edit(member.id, {
            CONNECT: false,
            SEND_MESSAGES: false
        }).catch(console.error);

        // find index of user id in database
        const index = voiceData.allowed_users.indexOf(member.id);
        if (index > -1) {
            voiceData.allowed_users.splice(index, 1);
        }

        // set new data
        await client.db.set('channels', voiceData.channel, voiceData);

        // Reply to interaction.
        interaction.reply({
            content: `✅ ${member} has been denied from joining your channel.`
        }).catch(console.error);
    }
}