const axios = require('axios');

// CONFIG - Осы жерді өз деректеріңмен толтыр
const FIREBASE_URL = "https://myproject-7f06d-default-rtdb.firebaseio.com/users.json";
const TG_BOT_TOKEN = "8356151933:AAFvhr6RQSRtkbf0maS3CMIDsjL3Y2Fy3Z0";
const TG_CHAT_ID = "1934206536";

async function generateWeeklyReport() {
    try {
        console.log("Malumotlar yig'ilmoqda...");
        const response = await axios.get(FIREBASE_URL);
        const users = response.data;

        if (!users) {
            console.log("Hechqanday ishtirokchi topilmadi!");
            return;
        }

        let userList = Object.values(users);

        // Сұрақтарға жауап берген қолданушыларды ғана іріктеу және сұрыптау
        // Рейтинг жалпы балл (score) бойынша жасалады
        userList.sort((a, b) => (b.score || 0) - (a.score || 0));

        let reportMessage = "📊 <b>HAFTALIK YAKUN</b>\n";
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
            reportMessage += `   ├ Ball: <b>${score}</b>\n`;
            reportMessage += `   └ Javoblar: ${correct}✅ | ${wrong}❌ (${accuracy}%)\n\n`;
        });

        reportMessage += "--------------------------------\n";
        reportMessage += "🔥 <i>Bu bugungi haftaning yakuniy statistikasi</i>";

        // Telegram-ға жіберу
        await axios.post(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
            chat_id: TG_CHAT_ID,
            text: reportMessage,
            parse_mode: 'HTML'
        });

        console.log("Hisob muvoffiyaqatli yuborildi!");

    } catch (error) {
        console.error("Xatolik yuz berdi:", error.message);
    }
}

generateWeeklyReport();
