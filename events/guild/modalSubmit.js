const { report_channel_id } = require('../../settings.json');

module.exports = async(client, modal) => {
    if (modal.customId === 'modal_report') {
        // get input value
        const reasonOfReport = modal.getTextInputValue('modal_reason_value');

        // cache report channel
        const reportChannel = modal.guild.channels.cache.get(report_channel_id);
        
        // check if report channel is not exists
        if (!reportChannel) {
            return modal.reply({
                content: ':x: Report channel is not exists, please report this issue to developers of this bot.',
                ephemeral: true
            });
        }

        // send report to report channel
        reportChannel.send({
            content: `**New report from ${modal.user} (\`${modal.user.id}\`)**\n\nReason of report: ${reasonOfReport}`
        });

        // reply to modal
        modal.reply({
            content: "✅ Your report has been sent to moderators"
        });
    }
}