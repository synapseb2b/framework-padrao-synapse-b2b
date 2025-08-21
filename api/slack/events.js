// ARQUIVO: api/slack/events.js
import bolt from '@slack/bolt';
import { generateProject } from '../../lib/project-generator.js'; // <-- Importamos nossa lógica!

const { App } = bolt;
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// ... (O código do app.command('/criar-projeto', ...) continua o mesmo)

// Ouve pelo envio do formulário
app.view('create_project_view', async ({ ack, body, view, client, logger }) => {
  await ack();

  const user = body.user.id;
  const projectName = view.state.values.project_name_block.project_name_input.value;
  const repoName = view.state.values.repo_name_block.repo_name_input.value;

  // Assume o tipo "Cliente" por padrão para o Slack, podemos adicionar a pergunta depois
  const projectType = 'client'; 
  const description = `Projeto para ${projectName}`;

  try {
    await client.chat.postMessage({
      channel: user,
      text: `Ok! Recebi o pedido para o projeto "${projectName}". Começando a mágica... 🧙‍♂️`
    });

    // =================================================================
    // AQUI A MÁGICA ACONTECE!
    await generateProject({ projectType, projectName, repoName, description });
    // =================================================================

    await client.chat.postMessage({
      channel: user,
      text: `🎉 Pronto! O projeto "${projectName}" foi criado com sucesso!`
    });

  } catch (error) {
    logger.error(error);
    await client.chat.postMessage({
      channel: user,
      text: `❌ Opa, algo deu errado: ${error.message}`
    });
  }
});

// ... (o resto do código, app.command e o boilerplate da Vercel, continua o mesmo)