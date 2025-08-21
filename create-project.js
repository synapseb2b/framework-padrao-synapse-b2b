// Importa as bibliotecas e módulos necessários

import inquirer from 'inquirer';

import { Octokit } from '@octokit/rest';

import { execa } from 'execa';

import fs from 'fs';

import path from 'path';

import 'dotenv/config'; // Carrega as variáveis do arquivo .env



// --- FUNÇÃO PRINCIPAL ---

async function main() {

  console.log('--- 🤖 Assistente de Projetos Synapse B2B ---');

  console.log('Olá! Estou pronto para iniciar um novo projeto para você.');



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

  

 // Linha ajustada (para a sua nova estrutura)

const destPath = path.resolve(

  process.cwd(), // O script roda de dentro de 'framework-padrao-synapse-b2b'

  '..',          // Volta para a pasta 'synapseb2b'

  isClientProject ? 'client-projects' : 'internal-projects', // Entra na pasta de destino correta

  repoName

);



  console.log(`\n✅ Ótimo! O projeto será criado em: ${destPath}`);



  console.log('\n⏳ Criando repositório no GitHub...');

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  

  let repoUrl;

  try {

    const response = await octokit.repos.createForAuthenticatedUser({

      name: repoName,

      description: description,

      private: true,

    });

    repoUrl = response.data.clone_url;

    console.log(`✅ Repositório "${repoName}" criado com sucesso!`);

  } catch (error) {

    console.error('❌ Erro ao criar o repositório no GitHub:', error.message);

    return;

  }

  

  console.log('⏳ Copiando a estrutura do framework...');

  if (fs.existsSync(destPath)) {

    console.error(`❌ Erro: A pasta de destino "${destPath}" já existe.`);

    return;

  }

  fs.cpSync(process.cwd(), destPath, { 

    recursive: true,

    filter: (src) => !src.includes('node_modules') && !src.includes('create-project.js') && !src.includes('.env') && !src.includes('package.json') && !src.includes('package-lock.json'),

  });

  console.log('✅ Arquivos do framework copiados.');



  const readmeTemplateFile = isClientProject ? 'README.template.client.md' : 'README.template.internal.md';

  const readmeTemplatePath = path.join(destPath, readmeTemplateFile);

  let readmeContent = fs.readFileSync(readmeTemplatePath, 'utf8');



  readmeContent = readmeContent.replace(/{{NOME_DO_PROJETO}}/g, projectName);

  readmeContent = readmeContent.replace(/{{URL_REPOSITORIO}}/g, repoUrl);

  

  fs.writeFileSync(path.join(destPath, 'README.md'), readmeContent);

  fs.unlinkSync(path.join(destPath, 'README.template.client.md'));

  fs.unlinkSync(path.join(destPath, 'README.template.internal.md'));

  console.log('✅ README.md gerado e preenchido.');

  

  console.log('⏳ Inicializando o Git e enviando o primeiro commit...');

  try {

    await execa('git', ['init'], { cwd: destPath });

    await execa('git', ['add', '.'], { cwd: destPath });

    await execa('git', ['commit', '-m', 'Initial commit from Synapse B2B Framework'], { cwd: destPath });

    await execa('git', ['branch', '-M', 'main'], { cwd: destPath });

    await execa('git', ['remote', 'add', 'origin', repoUrl], { cwd: destPath });

    await execa('git', ['push', '-u', 'origin', 'main'], { cwd: destPath });

    console.log('✅ Projeto enviado para o GitHub com sucesso!');

  } catch (error) {

    console.error('❌ Erro durante a inicialização do Git:', error.message);

    return;

  }



  console.log('\n🎉 Processo concluído! O projeto está pronto para o desenvolvimento.');

}



main();

