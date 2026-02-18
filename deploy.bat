@echo off
echo Adding changes to git...
git add .

set /p message="Enter commit message: "
git commit -m "%message%"

echo Pushing to GitHub...
git push

echo Done! Your changes will be live in ~30 seconds.
pause
