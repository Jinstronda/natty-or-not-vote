-- Make jistronda100@gmail.com an admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'jistronda100@gmail.com';

-- If the profile doesn't exist yet, this will be handled by the app when they first sign up