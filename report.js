const axios = require('axios');

// CONFIG - Осы жерді өз деректеріңмен толтыр
const FIREBASE_URL = "https://myproject-7f06d-default-rtdb.firebaseio.com/users.json";
const TG_BOT_TOKEN = "8356151933:AAFvhr6RQSRtkbf0maS3CMIDsjL3Y2Fy3Z0";
const TG_CHAT_ID = "1934206536";

async function generateWeeklyReport() {
    try {
        console.log("Деректер жиналуда...");
        const response = await axios.get(FIREBASE_URL);
        const users = response.data;

        if (!users) {
            console.log("Ешқандай қолданушы табылмады.");
            return;
        }

        let userList = Object.values(users);

        // Сұрақтарға жауап берген қолданушыларды ғана іріктеу және сұрыптау
        // Рейтинг жалпы балл (score) бойынша жасалады
        userList.sort((a, b) => (b.score || 0) - (a.score || 0));

        let reportMessage = "📊 <b>АПТАЛЫҚ ҚОРЫТЫНДЫ (РЕЙТИНГ)</b>\n";
        reportMessage += "--------------------------------\n\n";

        userList.forEach((user, index) => {
            const name = user.name || "Аноним";
            const surname = user.surname ? user.surname.charAt(0) + "." : "";
            const className = user.class || "?";
            const score = user.score || 0;
            const correct = user.correctAnswers || 0;
            const wrong = user.wrongAnswers || 0;
            const total = correct + wrong;
            
            // Дұрыс жауап беру пайызын есептеу
            const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

            let medal = "";
            if (index === 0) medal = "🥇 ";
            else if (index === 1) medal = "🥈 ";
            else if (index === 2) medal = "🥉 ";
            else medal = `${index + 1}. `;

            reportMessage += `${medal}<b>${name} ${surname}</b> (${className})\n`;
            reportMessage += `   ├ Балл: <b>${score}</b>\n`;
            reportMessage += `   └ Жауаптар: ${correct}✅ | ${wrong}❌ (${accuracy}%)\n\n`;
        });

        reportMessage += "--------------------------------\n";
        reportMessage += "🔥 <i>Барлық қатысушыларға рақмет! Жаңа апта - жаңа мүмкіндік!</i>";

        // Telegram-ға жіберу
        await axios.post(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
            chat_id: TG_CHAT_ID,
            text: reportMessage,
            parse_mode: 'HTML'
        });

        console.log("Есеп сәтті жіберілді!");

    } catch (error) {
        console.error("Қате орын алды:", error.message);
    }
}

generateWeeklyReport();
