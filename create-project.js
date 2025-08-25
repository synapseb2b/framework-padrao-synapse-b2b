// ARQUIVO: create-project.js (Versão final e correta)

import inquirer from 'inquirer';
import { Octokit } from '@octokit/rest';
import { execa } from 'execa';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// --- MENSAGENS DE BOAS-VINDAS ---
console.log('--- 🤖 Assistente de Projetos Synapse B2B ---');
console.log('Olá! Estou pronto para iniciar um novo projeto para você.\n');

// --- FUNÇÃO PRINCIPAL ---
async function main() {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectType',
        message: 'Me diga, este é um projeto para a Synapse ou para um cliente?',
        choices: [
          { name: 'Interno (I)', value: 'internal' },
          { name: 'Cliente (C)', value: 'client' },
        ],
      },
      {
        type: 'input',
        name: 'projectName',
        message: 'Entendido. Qual será o nome completo do projeto?',
        validate: input => input ? true : 'O nome não pode ser vazio.',
      },
      {
        type: 'input',
        name: 'repoName',
        message: 'Ótimo nome! E qual nome devo usar para o repositório no GitHub? (ex: cliente-x-website)',
        validate: input => input ? true : 'O nome do repositório não pode ser vazio.',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Digite uma breve descrição para o repositório:',
      },
    ]);

    const { projectType, projectName, repoName, description } = answers;
    const isClientProject = projectType === 'client';
    
    const destPath = path.resolve(
      process.cwd(),
      '..',
      isClientProject ? 'client-projects' : 'internal-projects',
      repoName
    );

    if (fs.existsSync(destPath)) {
      console.error(`❌ Erro: A pasta de destino "${destPath}" já existe. Por favor, remova-a e o repositório no GitHub antes de continuar.`);
      return;
    }
    
    console.log(`\n✅ Ótimo! O projeto será criado em: ${destPath}`);

    console.log('\n⏳ Criando repositório no GitHub...');
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    
    const repoUrl = (await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description: description,
      private: true,
    })).data.clone_url;

    console.log(`✅ Repositório "${repoName}" criado com sucesso!`);
    
    console.log('⏳ Clonando o repositório vazio...');
    const parentDir = path.resolve(destPath, '..');
    await execa('git', ['clone', repoUrl, destPath], { cwd: parentDir });
    console.log('✅ Repositório clonado.');
    
    console.log('⏳ Adicionando arquivos do framework...');
    const sourcePath = process.cwd();
    const itemsToCopy = fs.readdirSync(sourcePath).filter(
        (item) => !['node_modules', 'create-project.js', '.env', 'package.json', 'package-lock.json', '.git', 'api', 'lib'].includes(item)
    );
    for (const item of itemsToCopy) {
        fs.cpSync(path.join(sourcePath, item), path.join(destPath, item), { recursive: true });
    }
    
    const readmeTemplateFile = isClientProject ? 'README.template.client.md' : 'README.template.internal.md';
    const readmeTemplatePath = path.join(destPath, readmeTemplateFile);
    let readmeContent = fs.readFileSync(readmeTemplatePath, 'utf8');

    readmeContent = readmeContent.replace(/{{NOME_DO_PROJETO}}/g, projectName);
    readmeContent = readmeContent.replace(/{{URL_REPOSITÓRIO}}/g, repoUrl);
    
    fs.writeFileSync(path.join(destPath, 'README.md'), readmeContent);
    fs.unlinkSync(path.join(destPath, 'README.template.client.md'));
    fs.unlinkSync(path.join(destPath, 'README.template.internal.md'));
    console.log('✅ Arquivos do framework adicionados e README gerado.');

    console.log('⏳ Enviando o primeiro commit...');
    await execa('git', ['add', '.'], { cwd: destPath });
    await execa('git', ['commit', '-m', 'feat: Initial setup from Synapse B2B Framework'], { cwd: destPath });
    await execa('git', ['push'], { cwd: destPath });
    console.log('✅ Projeto enviado para o GitHub com sucesso!');

    console.log('\n🎉 Processo concluído! O projeto está pronto para o desenvolvimento.');

  } catch (error) {
    console.error('❌ Um erro inesperado ocorreu:', error.message);
  }
}

// --- PONTO DE PARTIDA ---
// Chama a função principal para iniciar o processo
main();