module.exports = {
    name: "allow",
    description: "Allow to specific member join your channel.",
    options: [
        {
            name: "user",
            description: "User to allow joining your channel.",
            type: 6,
            required: true
        }
    ],
    timeout: 15000,
    voiceOnly: true,
    tempOnly: true,
    allowManagers: true,
    run: async(interaction) => {
        // get member from option
        const member = interaction.options.getMember('user');

        // check if member has permissions before edit perms
        if (interaction.member.voice.channel.permissionsFor(member).has('CONNECT')) {
            return interaction.reply({
                content: `:x: ${member} already allowed to join your voice channel.`
            })
        }

        // Edit voice channel permission and allow them.
        await interaction.member.voice.channel.permissionOverwrites.edit(member.id, {
            CONNECT: true
        }).catch(console.error)

        // Reply to interaction
        interaction.reply({
            content: `✅ ${member} has been allowed to join ${interaction.member.voice.channel} channel.`
        }).catch(console.error)
    }
}