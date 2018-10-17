const moment = require('moment');
const config = require('../../src/config/index');

module.exports = function notifications(data) {
    const notify = JSON.parse(data);

    if (Object.keys(notify).length !== 0) {
        const items = notify.items[0];
        const today = moment().format('DD/MM/YYYY');
        let dataNotify = {};
        dataNotify.content_notifi = JSON.parse(items.content) ? JSON.parse(items.content) : 'lỗi content';
        dataNotify.noti_username = dataNotify.content_notifi.user_name ? dataNotify.content_notifi.user_name : 'lỗi content';
        dataNotify.noti_in_content = dataNotify.content_notifi.content ? dataNotify.content_notifi.content : 'lỗi content';
        dataNotify.noti_ticket_title = dataNotify.content_notifi.ticket_title ? dataNotify.content_notifi.ticket_title : 'lỗi content';
        dataNotify.link_view = config.FRONTEND_HOST + '/instance/ticket/view/' + items.ticket_id + '/' + items.business_id + '/' + items.type;
        dataNotify.action = items.type + '_' + items.ticket_id;
        dataNotify.notifyTime = '';
        if (today == moment.unix(items.time).format('DD/MM/YYYY')) {
            dataNotify.notifyTime = 'hôm nay lúc ' + moment.unix(items.time).format('hh:mm A');
        } else {
            dataNotify.notifyTime = moment.unix(items.time).format('DD/MM/YYYY hh:mm A');
        }
        dataNotify.allSeen = data.not_yet_seen_notifications ? data.not_yet_seen_notifications : '';
        dataNotify.seen = items.seen;
        dataNotify.count = items.count;

        let message = '';

        switch (parseInt(items.type)) {
            case 1:
                message = notifyAssign(dataNotify);
                break;
            case 2:
                message = notifyRelated(dataNotify);
                break;
            case 3:
                message = notifyUpdate(dataNotify);
                break;
            case 4:
                message = notifyExpired(dataNotify);
                break;
            case 5:
                message = notifyWarning(dataNotify);
                break;
            default:
                return message;
        }

        const result = {
            url: dataNotify.link_view,
            message
        }

        return result;

    }
}

function notifyAssign(dataNotify = {}) {
    return `${dataNotify.noti_user} ${dataNotify.noti_in_content} ${dataNotify.notifyTime}`;
}

function notifyRelated(dataNotify = {}) {
    return `${dataNotify.noti_user} ${dataNotify.noti_in_content} ${dataNotify.notifyTime}`;
}

function notifyUpdate(dataNotify = {}) {
    return `Ticket: ${dataNotify.noti_ticket_title} ${dataNotify.noti_in_content} ${dataNotify.notifyTime}`;
}

function notifyExpired(dataNotify = {}) {
    return `Ticket: ${dataNotify.noti_ticket_title} ${dataNotify.noti_in_content} ${dataNotify.notifyTime}`;
}

function notifyWarning(dataNotify = {}) {
    return `Ticket: ${dataNotify.noti_ticket_title} ${dataNotify.noti_in_content} ${dataNotify.notifyTime}`;
}
