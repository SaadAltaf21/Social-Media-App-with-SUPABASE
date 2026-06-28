const supabaseClient = supabase.createClient('https://focmkuvkeodocovyjvlv.supabase.co', 'sb_publishable_peT7zH1FLigNjlVNNdQczg_B3R5wRbA')

// Sign Up Form Handler
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log("Form submit hua!");
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;

        console.log("Supabase call shuru hone lagi hai...");

        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password
        })

        console.log("Supabase call khatam ho gayi!", data, error);

        if (error) {
            console.log(`Error`, error);
        } else {
            await supabaseClient
            .from('users')
            .insert([{ id: data.user.id, username: name, email }]);

            alert(`Account created successfully for ${name}...`);
            window.location.href = 'index.html';
        }
    });
}

// Login Form Handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        const { data, error } = await supabaseClient.auth.signInWithPassword({ 
            email,
            password
        });

        if (error) {
            alert(`Error: ${error.message}`); // Agar details galat hain to error dega
        } else {
            alert('Login successful! Welcome to your feed.');
            window.location.href = 'feed.html';
        }
    })
    };