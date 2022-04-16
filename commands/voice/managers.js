module.exports = {
    name: "managers",
    description: "Add managers to control in your voice channel",
    options: [
        {
            name: "user",
            description: "User to be manager",
            type: 6,
            required: true
        }
    ],
    tempOnly: true,
    tempOwnerOnly: true,
    voiceOnly: true,
    run: async(interaction, voiceData, client) => {
        // get user from option
        const user = interaction.options.getUser('user');

        // check if user already manager in voice channel
        const isManager = await client.db.includes('channels', `${interaction.member.voice.channel.id}.managers`, user.id);
        if (isManager) {
            return interaction.reply({
                content: `:x: ${user} is already manager in your voice channel`,
                ephemeral: true
            })
        }
        
        // push user id to managers array
        await client.db.push('channels', `${interaction.member.voice.channel.id}.managers`, user.id)

        // send interaction
        interaction.reply({
            content: `✅ ${user} has been added to channel managers`
        });
    }
}