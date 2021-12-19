const Timeout = new Set()
const { MessageEmbed } = require('discord.js');
const humanizeDuration = require("humanize-duration");

module.exports = async(client, interaction) => {
    if (interaction.isCommand() || interaction.isContextMenu()) {
		if (!client.commands.has(interaction.commandName)) return;
		if (!interaction.guild) return;
		const command = client.commands.get(interaction.commandName)
		try {
			if (command.timeout) {
				if (Timeout.has(`${interaction.user.id}${command.name}`)) {
					const embed = new MessageEmbed()
					.setTitle('You are in timeout!')
					.setDescription(`You need to wait **${humanizeDuration(command.timeout, { round: true })}** to use command again`)
					.setColor('#ff0000')
					return interaction.reply({ embeds: [embed], ephemeral: true })
				}
			}
			if (command.permission) {
				if (!interaction.member.permissions.has(command.permission)) {
					const embed = new MessageEmbed()
					.setTitle('Missing Permission')
					.setDescription(`:x: You need \`${command.permission}\` to use this command`)
					.setColor('#ff0000')
					.setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true }))
					.setTimestamp()
					return interaction.reply({ embeds: [embed], ephemeral: true })
				}
			}
			if (command.devs) {
				if (!process.env.OWNERS.includes(interaction.user.id)) {
					return interaction.reply({ content: ":x: Only devs can use this command", ephemeral: true });
				}
			}
			if (command.ownerOnly) {
				if (interaction.user.id !== interaction.guild.ownerId) {
					return interaction.reply({ content: "Only ownership of this server can use this command", ephemeral: true })
				}
			}
			command.run(interaction, client);
			Timeout.add(`${interaction.user.id}${command.name}`)
			setTimeout(() => {
				Timeout.delete(`${interaction.user.id}${command.name}`)
			}, command.timeout);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: ':x: There was an error while executing this command!', ephemeral: true });
		}
	}
	try {
		if (interaction.isSelectMenu()) {
			if (interaction.customId === 'ticket_cmd' || interaction.customId === 'info_cmd' || interaction.customId === 'general_cmd') {
				const selectedValues = interaction.values;
				const findCommand = client.commands.find(r => r.name === selectedValues[0])
				if (selectedValues.includes(findCommand.name)) {
					const embed = new MessageEmbed()
					.setColor(interaction.guild.me.displayHexColor)
					.setFooter(`Requested by ${interaction.user.tag}`, interaction.user.displayAvatarURL({ dynamic: true }))
					if (findCommand.name) {
						embed.setTitle(`Command: ${findCommand.name}`)
					}
					if (findCommand.description) {
						embed.setDescription(findCommand.description)
					}
					if (findCommand.usage) {
						embed.addField("Usage:", findCommand.usage)
					}
					if (findCommand.timeout) {
						embed.addField("Timeout:", humanizeDuration(findCommand.timeout, { round: true }))
					}
					interaction.reply({
						embeds: [embed],
						ephemeral: true
					})
				}
			}
		}
	} catch (e) {
		console.error(e)
		return false;
	}
} 
