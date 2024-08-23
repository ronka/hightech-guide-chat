import { CHAT_LINKS } from "@/constants/links";

// Creates a standalone question from the chat-history and the current question
export const STANDALONE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const USEFUL_LINKS = `אם מבקשים לינק לסירטון יוטיוב של יפתח בר על ההרצאה על השכר והמשכורות והמשא המתן עליהם תשלח את הלינק:
${CHAT_LINKS.FROM_THE_BOOK.IFTAH_BAR_SALARY_TALK}

אם מבקשים לינק לקבוצת פייסבוק של הסטונדטים באוניברסיטה הפתוחה:
${CHAT_LINKS.FROM_THE_BOOK.CS_FACEBOOK_GROUP}

אם מבקשים לינק לתוכנית לימוד שלי באוניברסיטה הפתוחה:
${CHAT_LINKS.FROM_THE_BOOK.LEARNING_PROGRAM}

לינק לקניית עותק פיזי ודיגיטלי דרך סטימצקי:
${CHAT_LINKS.PURCHASE.STEIMATZKY}

לינק לקניית עותק דיגיטלי דרך סטימצקי:
${CHAT_LINKS.PURCHASE.EVRIT}
`;

const EXTRA_LINKS = `

# מיטאפים
https://www.meetup.com/react-il/
https://www.meetup.com/javascript-israel/
https://www.meetup.com/at-wix/
https://www.meetup.com/nextjs-il/
https://www.meetup.com/css-masters-israel/ 

# סירטונים ביוטיוב של כנסים
https://www.youtube.com/@ReactNext/videos 
https://www.youtube.com/@nodetlv
https://www.youtube.com/@Reversim-summit 
https://www.youtube.com/@ReactConfOfficial

# פודקאסטים
ויקלי סינק - https://open.spotify.com/show/674Fd3udoDREXmBq44dHWY?si=009accbb6ef6485a 
עושים תוכנה - https://open.spotify.com/show/6HD5lER0EM4sQfErIBawUJ?si=0d9129751cd04315 
התמונה הגדולה(כבר לא מעלים פרקים אבל עדין הפרקים מעניינים) - https://open.spotify.com/show/6g7ZUYZV6bsWDTayF6hXtj?si=7982181f067e4f1b 
מפתחים חסרי תרבות(גם כבר לא מוציאים פרקים) - https://open.spotify.com/show/2O6rkTXUyTjnkKmftNuDuz?si=710db19680984499 

# טוויטר
יש קהילה עצומה והיופי הוא למצוא אנשים לבד, אבל הינה כמה ישראלים שאני עוקב אחריהם שיכולים לעזור לך להתחיל למצוא את האנשים שלך
https://twitter.com/HamatoYogi 
https://twitter.com/amsalemadir
https://twitter.com/nomsternom 
https://twitter.com/galstar 
https://twitter.com/DanShappir 

# לעקוב אחרי ערוצי יוטיוב שמפרסמים חדשות ומדריכים שאפשר ללמוד מהם לאט לאט
https://www.youtube.com/c/neetcode 
https://www.youtube.com/c/fireship - הכי מומלץ מבין כולם, מכור לערוץ הזה
https://www.youtube.com/channel/UCW5YeuERMmlnqo4oq8vwUpg 
https://www.youtube.com/@t3dotgg  - אחלה ללמוד ממנו על מה חם היום בשוק

# עוד כמה לינקים שיכולים להיות לך שימושיים
https://www.glassdoor.com - אתר שמרכז ביקורות על חברות, יש שם גם איזה שאלות הם שואלים בראיונות עבודה וכו׳. אחלה מקור ללמוד לראיונות עבודה
https://www.levels.fyi - כמו גלאסדור רק עם יותר מידע על משכורות ודרגות
https://neetcode.io - אחלה אתר(גם יש לו אחלה ערוץ יוטיוב) ללמוד לראיונות עבודה

`;

// Actual question you ask the chat and send the response to client
export const QA_TEMPLATE = `You are an enthusiastic AI assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, try to answer anyway with the context you find but you MOST mention that doesn't show precisely in the book.
your answers should be in Hebrew.

useful links from the book and about the book:
<links>
${USEFUL_LINKS}
</links>

usful links unlrelated to the book:
<links>
${EXTRA_LINKS}
</links>

{context}

Question: {question}
Helpful answer in markdown:`;

// If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.
