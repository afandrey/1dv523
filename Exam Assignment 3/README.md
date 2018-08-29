# Exam Assignment 3
## Installation guide
1. Create account on Digital Ocean

2. Create a droplet

    2.1 Select "One-click apps" and choose NodeJS
    
    2.2 Choose size and region

    2.3 Create a ssh key by following [this guide](https://www.digitalocean.com/community/tutorials/how-to-use-ssh-keys-with-digitalocean-droplets)
    
    2.4 Choose the ssh key you created
    
    2.5 Press create droplet
    
3. Once the droplet has been created, copy the IP adress of your droplet.
    
4. Start up a terminal in your root folder, and enter "ssh root@yourDropletIP"
    
5. Update the machine with _sudo apt-get update_
    
6. Install node using _npm install n -g_ 
        
7. Install pm2 using _npm install pm2 -g_   

8. Install nginx using _apt-get install nginx_ 
    
9. Connect git to your server/droplet according to [this guide](https://github.com/1dv523/af222ug-examination-3/wiki/Connect-git-to-server-droplet)

(Make sure you use the command _git push production_ if you make changes in your code)

10. You need to configure the nginx. 
    
    10.1 Navigate to _cd /etc/nginx/sites-available_ 

    10.2 Run the command _nano default_

    10.3 Press Ctrl-K until you have erased all lines

    10.4 Paste in the code available here: https://gist.github.com/thajo/d5db8e679c1237dfdb76

    Make sure you change the folder names so that they start with /root/var and not /var.

    10.5 Press Ctrl-X and then Y, to save. 

    10.6 Restart the nginx by using _service nginx restart_

11. Now it is time to create "Personal Access Token" and configure webhooks. Follow [this guide](https://github.com/1dv523/af222ug-examination-3/wiki/Token-And-Webhooks)

11. Go back to your wsApp folder. _cd /root/var/www/wsApp_

12. Install npm modules with: _npm install --production_

13. Run the application with: _pm2 start app.js_

14. The application is now running at _https://yourDropletIP_ 

15. Don't forget to stop the application with: _pm2 stop app.js_ before you push new code into the repository.
