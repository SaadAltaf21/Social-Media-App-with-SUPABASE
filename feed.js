const supabaseClient = supabase.createClient('https://focmkuvkeodocovyjvlv.supabase.co', 'sb_publishable_peT7zH1FLigNjlVNNdQczg_B3R5wRbA')

const postForm = document.getElementById('post-form');
const feedPosts = document.getElementById('feed-posts');
const logoutBtn = document.getElementById('logout-btn');

let loggedInUser = "Guest";
let currentUserId = null;

async function checkUser() {
    // 1. Pehle login user ki ID lein
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        alert("Poori post karne ke liye pehle login karein!");
        window.location.href = 'index.html'; // Agar login nahi hai to login page par bhej dein
        return; // Code ko yahin rok dein
    }

    if (user) {
        currentUserId = user.id;

        // 2. Apne 'users' table se us ID ka username nikalien
        const { data: userData, error } = await supabaseClient
            .from('users')
            .select('username')
            .eq('id', user.id)
            .single();

        if (userData) {
            loggedInUser = userData.username; // Yahan aapka real name aa gaya!
            console.log("Welcome:", loggedInUser);
        } else {
            loggedInUser = "User";
        }

        fetchTodo();
    }
}
checkUser();


if (postForm) {
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const postText = document.getElementById('post-text').value;
        const postImageUrl = document.getElementById('post-image-url').value;

        await createPostDOM(loggedInUser, postText, postImageUrl);

        // Reset form inputs
        postForm.reset();
    });
}

// Function to render a post dynamically in the UI
async function createPostDOM(username, text, imageUrl) {

    const { data: { user } } = await supabaseClient.auth.getUser();

    const { data, error } = await supabaseClient
        .from('posts')
        .insert([{
            text: text,
            imgurl: imageUrl,
            user_id: user ? user.id : null
        }]);

    // Agar database rule tod raha ho to alert on-screen chalega
    if (error) {
        console.error("Database Error details:", error);
        alert(`Post save nahi ho saki: ${error.message}`);
        return;
    }

    // Refresh instantly taake dynamic query immediate execute ho jaye
    window.location.reload();
}


async function fetchTodo() {
    const { data, error } = await supabaseClient
        .from('posts')
        .select(
            `id,
            imgurl,
            text,
            user_id,
            users(username, email)`
        )
        .limit(10)

    if (error) {
        return console.log(`Error`, error);
    }


    if (feedPosts) {
        feedPosts.innerHTML = ""; 
        
        if (data.length === 0) {
            feedPosts.innerHTML = "<h3 class='no-posts'>No posts yet!</h3>";
            return;
        }
        
        for (var i = 0; i < data.length; i++) {
            let element = data[i];
            
            let currentUsername = element.users ? element.users.username : "Unknown";
            let currentEmail = element.users ? element.users.email : "No Email";

            // 🔥 NEW & CRITICAL: Yahan check ho raha hai ke kya yeh post login user ki hai?
            let buttonsHTML = "";
            if (element.user_id === currentUserId && currentUserId !== null) {
                // Agar post login user ki hai, sirf tabhi yeh buttons HTML string mein add honge
                buttonsHTML = `
                    <button id="${element.id}" class="editBtn">Edit</button>
                    <button id="${element.id}" class="deleteBtn">Delete</button>
                `;
            }

            feedPosts.innerHTML += `<div class="post-card">
                <h1 class="post-header">@${currentUsername}</h1>
                <h4 class="post-email">${currentEmail}</h4>
                <h4 class="post-content">Description: ${element.text}</h4>
                ${element.imgurl ? `<img class="post-image" src="${element.imgurl}">` : ""}
                <br>
                ${buttonsHTML} </div>`;
        }
    }
}
fetchTodo()



document.body.addEventListener('click', async (e) => {
    if (e.target.classList.contains('editBtn') || e.target.textContent === 'Edit') {
        let text = prompt(`Edit Post`)

        if (text !== null && text.trim() !== "") {
            const { error } = await supabaseClient
                .from('posts')
                .update({ text })
                .eq('id', e.target.id)

            window.location.reload()
        }
    }

    if (e.target.classList.contains('deleteBtn') || e.target.textContent === 'Delete') {

        const response = await supabaseClient
            .from('posts')
            .delete()
            .eq('id', e.target.id)

        window.location.reload()
    }
});


// Logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        const { error } = await supabaseClient.auth.signOut()
        if (!error) {
            alert('Logging out...');
            window.location.href = 'index.html';
        }
    });
}