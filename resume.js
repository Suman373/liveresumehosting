const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const { execSync } = require('child_process');

const publicDirectory = path.join(__dirname, 'public');
const htmlPath = path.join(__dirname, 'index.html');
const scriptRegex = /<script>[\s\S]*?<\/script>/;
const git = simpleGit();
const BASE_URL = `https://suman373.github.io/liveresumehosting`;

async function addChangesAndCommit() {
  try {
    await git.add('.');
    await git.commit('feat: resume updated');
    console.log('Changes added and committed.');
  } catch (error) {
    console.error(`Failed to add changes: ${error}`);
  }
}

async function handleChangesAndVersionBump(releaseType) {
  try {
    console.log(`Bumping version with npm version ${releaseType}`);
    execSync(`npm version ${releaseType}`, { stdio: 'inherit' });
    console.log('Version successfully bumped.');
  } catch (error) {
    console.error(`Failed to bump version: ${error}`);
    process.exit(1);
  }
}

async function pushChangesToRemote() {
  try {
    console.log('Pushing commit to remote...');
    await git.push('origin', 'main');
    console.log('Successfully pushed changes to your repository.');
  } catch (err) {
    console.error(`An error occurred during git push: ${err}`);
  }
}

async function parseResume() {
  try {
    console.log('Starting resume parsing...');
    const files = fs.readdirSync(publicDirectory);
    const file = files[0];
    if (!file || file.length === 0) {
      console.log("File not found.");
      return;
    }
    console.log("Starting index.html parsing...");
    const htmlData = fs.readFileSync(htmlPath, 'utf-8');
    if (htmlData.match(scriptRegex)) {
      const newScript = `<script>window.location.href='${BASE_URL}/public/${file}'</script>`;
      const newContent = htmlData.replace(scriptRegex, newScript);
      fs.writeFileSync(htmlPath, newContent);
      console.log("HTML updated successfully");
      addChangesAndCommit();
      handleChangesAndVersionBump('patch'); // patch bumping for new resume files
      pushChangesToRemote();
    } else {
      console.log("Could not parse HTML");
      return;
    }
  } catch (error) {
    console.log(`An error occured while parsing resume : ${error}`);
  }
}

parseResume();
