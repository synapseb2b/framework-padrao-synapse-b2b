// ARQUIVO: lib/project-generator.js
import { Octokit } from '@octokit/rest';
import { execa } from 'execa';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// A lógica principal agora está dentro de uma função exportável
export async function generateProject({ projectType, projectName, repoName, description }) {
  const isClientProject = projectType === 'client';

  const destPath = path.resolve(
    process.cwd(),
    '..',
    isClientProject ? 'client-projects' : 'internal-projects',
    repoName
  );

  if (fs.existsSync(destPath)) {
    throw new Error(`A pasta de destino "${destPath}" já existe.`);
  }

  console.log(`\n✅ Ótimo! O projeto será criado em: ${destPath}`);

  // O resto da lógica...
  console.log('\n⏳ Criando repositório no GitHub...');
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const repoUrl = (await octokit.repos.createForAuthenticatedUser({ name: repoName, description, private: true })).data.clone_url;
  console.log(`✅ Repositório "${repoName}" criado com sucesso!`);

  console.log('⏳ Clonando o repositório vazio...');
  const parentDir = path.resolve(destPath, '..');
  await execa('git', ['clone', repoUrl, destPath], { cwd: parentDir });
  console.log('✅ Repositório clonado.');

  console.log('⏳ Adicionando arquivos do framework...');
  const sourcePath = process.cwd();
  const itemsToCopy = fs.readdirSync(sourcePath).filter(
      (item) => !['node_modules', '.git', 'api', 'lib'].includes(item) // Atualizamos para não copiar a si mesmo
  );
  for (const item of itemsToCopy) {
      fs.cpSync(path.join(sourcePath, item), path.join(destPath, item), { recursive: true });
  }

  const readmeTemplateFile = isClientProject ? 'README.template.client.md' : 'README.template.internal.md';
  const readmeTemplatePath = path.join(destPath, readmeTemplateFile);
  let readmeContent = fs.readFileSync(readmeTemplatePath, 'utf8');
  readmeContent = readmeContent.replace(/{{NOME_DO_PROJETO}}/g, projectName).replace(/{{URL_REPOSITÓRIO}}/g, repoUrl);
  fs.writeFileSync(path.join(destPath, 'README.md'), readmeContent);
  fs.unlinkSync(path.join(destPath, 'README.template.client.md'));
  fs.unlinkSync(path.join(destPath, 'README.template.internal.md'));
  console.log('✅ Arquivos do framework adicionados e README gerado.');

  console.log('⏳ Enviando o primeiro commit...');
  await execa('git', ['add', '.'], { cwd: destPath });
  await execa('git', ['commit', '-m', 'feat: Initial setup from Synapse B2B Framework'], { cwd: destPath });
  await execa('git', ['push'], { cwd: destPath });
  console.log('✅ Projeto enviado para o GitHub com sucesso!');
}