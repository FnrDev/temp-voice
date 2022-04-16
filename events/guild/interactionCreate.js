const Timeout = new Set()
const { MessageEmbed } = require('discord.js');
const humanizeDuration = require("humanize-duration");
const { Modal, TextInputComponent, showModal } = require('discord-modals');

module.exports = async(client, interaction) => {
    if (interaction.isCommand() || interaction.isContextMenu()) {
		if (!client.commands.has(interaction.commandName)) return;
		if (!interaction.guild) return;
		const command = client.commands.get(interaction.commandName);
		const voiceData = await client.db.get('channels', interaction.member.voice.channel.id);
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
					.setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
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
			if (command.voiceOnly) {
				if (!interaction.member.voice.channel) {
					return interaction.reply({
						content: ":x: You must be in voice channel to use this command.",
						ephemeral: true
					})
				}
			}
			if (command.tempOnly) {
				if (!voiceData) {
					return interaction.reply({
						content: ":x: You can't use this command in non temp voice channels",
						ephemeral: true
					})
				}
			}
			if (command.allowManagers) {
				if (voiceData.owner !== interaction.user.id) {
					if (!voiceData.managers.includes(interaction.user.id)) {
						return interaction.reply({
							content: ":x: You must be manager in voice channel to do this command.",
							ephemeral: true
						})
					}
				}
			}
			if (command.voiceOwnerOnly) {
				if (voiceData.owner !== interaction.user.id) {
					return interaction.reply({
						content: ":x: You must be owner of the channel.",
						ephemeral: true
					})
				}
			}
			command.run(interaction, voiceData, client);
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
			if (interaction.customId === 'report_users') {
				// fetch member from select menu values
				const fetchReportUser = await interaction.guild.members.fetch(interaction.values[0]).catch(e => false);

				// check if not member exits
				if (!fetchReportUser) {
					return interaction.reply({
						content: ":x: I can't find this member.",
						ephemeral: true
					})
				}

				// create modal
				const modal = new Modal()
				.setCustomId('modal_report')
				.setTitle(`Report ${fetchReportUser.user.tag}`)

				// create reason component
				const reasonComponent = new TextInputComponent()
				.setCustomId('modal_reason_value')
				.setLabel('Reason of the report.')
				.setStyle('LONG')
				.setMinLength(10)
				.setMaxLength(250)
				.setPlaceholder('Keeps harassing and insulting me.')
				.setRequired(true)

				// map every component and add them
				const rows = [reasonComponent].map((component) => modal.addComponents(component));

				// show modal to user
				showModal(...rows, {
					client,
					interaction
				});
			}
		}
	} catch (e) {
		console.error(e)
		return false;
	}
} 
