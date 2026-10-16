import { LibrarySnippet } from '../types/codeforge';

export const INITIAL_LIBRARY_SNIPPETS: LibrarySnippet[] = [
  {
    id: 'lib-tbl-utils',
    name: 'Manipulação Avançada de Tabelas em Luau',
    category: 'Utilities',
    type: 'ModuleScript',
    location: 'ReplicatedStorage > Modules > TableUtil',
    description: 'Utilitário profissional para clonagem profunda (deep copy), congelamento de metatabelas (table.freeze) e mesclagem de tabelas de configuração.',
    tags: ['tabelas', 'deep copy', 'luau', 'util'],
    code: `--!strict
-- ReplicatedStorage/Modules/TableUtil.luau
-- Módulo utilitário para manipulação segura e performática de tabelas no Roblox

local TableUtil = {}

-- Realiza uma cópia profunda (deep copy) de uma tabela, preservando sub-tabelas
function TableUtil.deepCopy<T>(original: T): T
	if typeof(original) ~= "table" then
		return original
	end
	
	local copy = {}
	for key, value in pairs(original :: any) do
		if typeof(value) == "table" then
			copy[key] = TableUtil.deepCopy(value)
		else
			copy[key] = value
		end
	end
	
	return (copy :: any) :: T
end

-- Congela recursivamente uma tabela para torná-la imutável (segurança para configs)
function TableUtil.deepFreeze<T>(tbl: T): T
	if typeof(tbl) ~= "table" then
		return tbl
	end
	
	for _, value in pairs(tbl :: any) do
		if typeof(value) == "table" then
			TableUtil.deepFreeze(value)
		end
	end
	
	return table.freeze(tbl :: any) :: T
end

-- Mescla duas tabelas (as propriedades da tabela 'override' sobrescrevem as de 'defaults')
function TableUtil.merge<T>(defaults: T, override: {[string]: any}): T
	local result = TableUtil.deepCopy(defaults)
	for key, value in pairs(override) do
		(result :: any)[key] = value
	end
	return result
end

return TableUtil
`,
    explanation: 'Em Luau, tabelas são referências na memória. Fazer "a = b" apenas aponta para o mesmo objeto. O TableUtil.deepCopy cria uma estrutura totalmente isolada. Além disso, table.freeze é um recurso nativo do Luau que impede modificações acidentais em tempo de execução, garantindo integridade de configurações de armas ou itens.'
  },
  {
    id: 'lib-cooldown-timer',
    name: 'Gerenciador Moderno de Debounce e Cooldowns',
    category: 'Utilities',
    type: 'ModuleScript',
    location: 'ReplicatedStorage > Modules > CooldownManager',
    description: 'Sistema anti-spam com os.clock() e task library, permitindo debounce por jogador ou por habilidade sem travar a thread principal.',
    tags: ['cooldown', 'debounce', 'task', 'performance'],
    code: `--!strict
-- ReplicatedStorage/Modules/CooldownManager.luau
-- Gerenciador de Cooldowns com alta precisão usando os.clock()

local CooldownManager = {}
CooldownManager.__index = CooldownManager

export type CooldownTracker = {
	cooldowns: {[string]: number},
	checkAndTrigger: (self: CooldownTracker, actionName: string, duration: number) -> boolean,
	getRemaining: (self: CooldownTracker, actionName: string, duration: number) -> number,
	reset: (self: CooldownTracker, actionName: string) -> ()
}

function CooldownManager.new(): CooldownTracker
	local self = setmetatable({}, CooldownManager)
	self.cooldowns = {}
	return (self :: any) :: CooldownTracker
end

-- Verifica se a ação está liberada; se estiver, registra o tempo atual e retorna true
function CooldownManager:checkAndTrigger(actionName: string, duration: number): boolean
	local now = os.clock()
	local lastTime = self.cooldowns[actionName]
	
	if not lastTime or (now - lastTime) >= duration then
		self.cooldowns[actionName] = now
		return true
	end
	
	return false
end

-- Retorna quantos segundos restam para o término do cooldown
function CooldownManager:getRemaining(actionName: string, duration: number): number
	local now = os.clock()
	local lastTime = self.cooldowns[actionName]
	
	if not lastTime then
		return 0
	end
	
	local elapsed = now - lastTime
	local remaining = duration - elapsed
	return math.max(0, remaining)
end

function CooldownManager:reset(actionName: string)
	self.cooldowns[actionName] = nil
end

return CooldownManager
`,
    explanation: 'Ao invés de usar booleanos com task.wait() que bloqueiam scripts e causam problemas de sincronia, CooldownManager usa carimbos de tempo em os.clock(). Isso permite verificar instantaneamente se uma habilidade está em recarga ou calcular o percentual restante para a barra na interface.'
  },
  {
    id: 'lib-tween-door',
    name: 'Porta Deslizante Suave com TweenService',
    category: 'Interaction',
    type: 'Script',
    location: 'Workspace > InteractiveDoor > DoorController',
    description: 'Controle de porta ou plataforma móvel com ProximityPrompt, TweenService para interpolação fluida e som sincronizado.',
    tags: ['tweenservice', 'porta', 'proximityprompt', 'animacao'],
    code: `--!strict
-- Script colocado dentro do Modelo da Porta no Workspace
local TweenService = game:GetService("TweenService")

local doorModel = script.Parent :: Model
local doorHinge = doorModel:WaitForChild("Hinge") :: BasePart
local prompt = doorModel:WaitForChild("ProximityPrompt") :: ProximityPrompt

local isOpen = false
local isBusy = false

-- Configurações do Tween
local tweenInfo = TweenInfo.new(
	1.2, -- Duração em segundos
	Enum.EasingStyle.Cubic,
	Enum.EasingDirection.Out
)

local closedCFrame = doorHinge.CFrame
-- Gira 90 graus em torno do eixo Y da dobradiça
local openedCFrame = closedCFrame * CFrame.Angles(0, math.rad(90), 0)

local function toggleDoor()
	if isBusy then return end
	isBusy = true
	prompt.Enabled = false
	
	local targetCFrame = isOpen and closedCFrame or openedCFrame
	local tween = TweenService:Create(doorHinge, tweenInfo, {CFrame = targetCFrame})
	
	tween:Play()
	tween.Completed:Connect(function()
		isOpen = not isOpen
		isBusy = false
		prompt.ActionText = isOpen and "Fechar" or "Abrir"
		prompt.Enabled = true
	end)
end

prompt.Triggered:Connect(function(player: Player)
	-- Opcional: checar permissões ou chaves no inventário do jogador aqui
	toggleDoor()
end)
`,
    explanation: 'TweenService interpola propriedades no Roblox com curvas matemáticas (EasingStyle). No exemplo, a porta gira suavemente ao redor de um Hinge Part. O script previne disparos concorrentes enquanto o Tween está em andamento.'
  },
  {
    id: 'lib-safe-remote',
    name: 'Rede Segura: Validador de RemoteEvents com Anti-Exploit',
    category: 'Networking',
    type: 'Script',
    location: 'ServerScriptService > NetworkHandler',
    description: 'Padrão essencial para receber RemoteEvents no servidor com checagem de distância física, verificação de tipo e limite de taxa (rate limit).',
    tags: ['remoteevent', 'antiexploit', 'seguranca', 'rede'],
    code: `--!strict
-- ServerScriptService/NetworkHandler.server.luau
-- Proteção contra pacotes forjados e spam de RemoteEvents

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local NetworkFolder = ReplicatedStorage:WaitForChild("Network") :: Folder
local CollectItemEvent = NetworkFolder:WaitForChild("CollectItemEvent") :: RemoteEvent

-- Tabela para rate-limiting: [UserId] = { lastCall = number, callCount = number }
local playerCallHistory: {[number]: {lastTime: number, count: number}} = {}

local MAX_CALLS_PER_SECOND = 4
local MAX_INTERACTION_DISTANCE = 20 -- studs

CollectItemEvent.OnServerEvent:Connect(function(player: Player, targetPart: any)
	-- 1. Verificação de Tipo dos Parâmetros
	if typeof(targetPart) ~= "Instance" or not targetPart:IsA("BasePart") then
		warn(string.format("Tentativa de chamada inválida por %s (parâmetro não é BasePart)", player.Name))
		return
	end
	
	-- 2. Rate-Limiting no Servidor (Prevenção de spam/DDoS)
	local now = os.clock()
	local userId = player.UserId
	local history = playerCallHistory[userId]
	
	if not history or (now - history.lastTime) > 1 then
		playerCallHistory[userId] = {lastTime = now, count = 1}
	else
		history.count += 1
		if history.count > MAX_CALLS_PER_SECOND then
			warn(string.format("Rate limit excedido por %s!", player.Name))
			return
		end
	end
	
	-- 3. Verificação de Distância Real no Servidor
	local character = player.Character
	if not character then return end
	local rootPart = character:FindFirstChild("HumanoidRootPart") :: BasePart?
	if not rootPart then return end
	
	local distance = (rootPart.Position - targetPart.Position).Magnitude
	if distance > MAX_INTERACTION_DISTANCE then
		warn(string.format("Jogador %s tentou interagir a %.1f studs (máximo %d)", player.Name, distance, MAX_INTERACTION_DISTANCE))
		return
	end
	
	-- 4. Executar Lógica do Jogo com Segurança
	print(string.format("[Servidor] Jogador %s coletou validamente o item %s", player.Name, targetPart.Name))
	-- Ex: Dar moeda, destruir item ou disparar som
end)

Players.PlayerRemoving:Connect(function(player)
	playerCallHistory[player.UserId] = nil
end)
`,
    explanation: 'Exploiters podem disparar RemoteEvents a qualquer momento com argumentos arbitrários. Este exemplo valida o tipo do parâmetro, a distância entre o personagem e o alvo no espaço 3D (Magnitude) e implementa limitação de taxa por segundo, blindando seu jogo contra abusos.'
  },
  {
    id: 'lib-datastore-safe',
    name: 'Persistência Segura com DataStoreService & UpdateAsync',
    category: 'Data',
    type: 'Script',
    location: 'ServerScriptService > DataStoreManager',
    description: 'Implementação de salvamento de moedas e nível com pcall, UpdateAsync para evitar sobrescritas concorrentes e BindToClose.',
    tags: ['datastore', 'updateasync', 'save', 'leaderstats'],
    code: `--!strict
-- ServerScriptService/DataStoreManager.server.luau
-- Salvamento robusto com proteção contra perda de dados

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local PlayerDataStore = DataStoreService:GetDataStore("PlayerData_v1")

type PlayerData = {
	Coins: number,
	Level: number,
	LastSaved: number
}

local DEFAULT_DATA: PlayerData = {
	Coins = 0,
	Level = 1,
	LastSaved = 0
}

-- Carrega dados quando o jogador entra
local function onPlayerAdded(player: Player)
	local leaderstats = Instance.new("Folder")
	leaderstats.Name = "leaderstats"
	leaderstats.Parent = player
	
	local coinsValue = Instance.new("IntValue")
	coinsValue.Name = "Coins"
	coinsValue.Value = DEFAULT_DATA.Coins
	coinsValue.Parent = leaderstats
	
	local levelValue = Instance.new("IntValue")
	levelValue.Name = "Level"
	levelValue.Value = DEFAULT_DATA.Level
	levelValue.Parent = leaderstats
	
	-- Busca dados no DataStore com pcall
	local key = "Player_" .. player.UserId
	local success, savedData = pcall(function()
		return PlayerDataStore:GetAsync(key)
	end)
	
	if success and savedData then
		coinsValue.Value = savedData.Coins or DEFAULT_DATA.Coins
		levelValue.Value = savedData.Level or DEFAULT_DATA.Level
	elseif not success then
		warn(string.format("Falha ao carregar dados de %s: %s", player.Name, tostring(savedData)))
	end
end

-- Salva dados usando UpdateAsync
local function savePlayerData(player: Player)
	local leaderstats = player:FindFirstChild("leaderstats")
	if not leaderstats then return end
	
	local coins = leaderstats:FindFirstChild("Coins") :: IntValue?
	local level = leaderstats:FindFirstChild("Level") :: IntValue?
	if not coins or not level then return end
	
	local key = "Player_" .. player.UserId
	local success, err = pcall(function()
		PlayerDataStore:UpdateAsync(key, function(oldData)
			local newCoins = coins.Value
			local newLevel = level.Value
			
			return {
				Coins = newCoins,
				Level = newLevel,
				LastSaved = os.time()
			}
		end)
	end)
	
	if not success then
		warn(string.format("Erro ao salvar dados de %s: %s", player.Name, tostring(err)))
	end
end

Players.PlayerAdded:Connect(onPlayerAdded)
Players.PlayerRemoving:Connect(savePlayerData)

-- Salva todos os jogadores se o servidor fechar
game:BindToClose(function()
	if RunService:IsStudio() then
		task.wait(1)
	end
	for _, player in ipairs(Players:GetPlayers()) do
		task.spawn(savePlayerData, player)
	end
end)
`,
    explanation: 'Utilizar UpdateAsync ao invés de SetAsync previne corrupção caso dois servidores tentem gravar dados do mesmo jogador simultaneamente. A chamada de game:BindToClose garante que se o servidor for desligado pela Roblox, todos os jogadores tenham seus dados gravados.'
  },
  {
    id: 'lib-input-mapper',
    name: 'Controles Multiplataforma (PC, Celular e Gamepad)',
    category: 'Movement',
    type: 'LocalScript',
    location: 'StarterPlayer > StarterPlayerScripts > InputController',
    description: 'Gerenciador moderno de inputs usando ContextActionService com botão na tela para mobile e suporte a gatilhos de controle.',
    tags: ['input', 'mobile', 'gamepad', 'contextactionservice'],
    code: `--!strict
-- StarterPlayer/StarterPlayerScripts/InputController.client.luau
local ContextActionService = game:GetService("ContextActionService")
local Players = game:GetService("Players")

local ACTION_SPRINT = "PlayerSprintAction"
local isSprinting = false

local function handleSprint(actionName: string, inputState: Enum.UserInputState, inputObject: InputObject)
	local character = Players.LocalPlayer.Character
	if not character then return Enum.ContextActionResult.Pass end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid then return Enum.ContextActionResult.Pass end
	
	if inputState == Enum.UserInputState.Begin then
		isSprinting = true
		humanoid.WalkSpeed = 24
	elseif inputState == Enum.UserInputState.End or inputState == Enum.UserInputState.Cancel then
		isSprinting = false
		humanoid.WalkSpeed = 16
	end
	
	return Enum.ContextActionResult.Sink
end

-- Vincula a ação com Shift esquerdo (PC), botão B / R1 (Gamepad) e cria botão tátil no Mobile
ContextActionService:BindAction(
	ACTION_SPRINT,
	handleSprint,
	true, -- Cria botão na tela para celular/tablet
	Enum.KeyCode.LeftShift,
	Enum.KeyCode.ButtonR1
)

-- Configura título do botão touch no celular
ContextActionService:SetTitle(ACTION_SPRINT, "Correr")
ContextActionService:SetPosition(ACTION_SPRINT, UDim2.new(1, -120, 1, -160))
`,
    explanation: 'ContextActionService é a forma recomendada de gerenciar inputs multiplataforma no Roblox. Ao passar o terceiro argumento como true, o jogo cria automaticamente botões na tela para dispositivos móveis sem precisar programar uma UI separada.'
  },
  {
    id: 'lib-proximity-prompt',
    name: 'ProximityPrompt Customizado com Efeitos e Sons',
    category: 'Interaction',
    type: 'Script',
    location: 'Workspace > Chest > PromptHandler',
    description: 'Configuração completa de ProximityPrompt com barra de progresso (HoldDuration), texto de ação dinâmico e animação.',
    tags: ['proximityprompt', 'bau', 'interacao', 'som'],
    code: `--!strict
-- Script no servidor anexado a um Baú ou Objeto Interativo
local prompt = script.Parent:WaitForChild("ProximityPrompt") :: ProximityPrompt
local sound = script.Parent:FindFirstChild("OpenSound") :: Sound?

-- Configurações visuais e de alcance
prompt.ActionText = "Abrir Baú"
prompt.ObjectText = "Baú Dourado"
prompt.KeyboardKeyCode = Enum.KeyCode.E
prompt.GamepadKeyCode = Enum.KeyCode.ButtonX
prompt.HoldDuration = 1.0 -- Segurar por 1 segundo
prompt.MaxActivationDistance = 12
prompt.RequiresLineOfSight = true

prompt.PromptButtonHoldBegan:Connect(function(player: Player)
	print(player.Name .. " começou a abrir o baú...")
end)

prompt.Triggered:Connect(function(player: Player)
	prompt.Enabled = false
	if sound then sound:Play() end
	
	print(string.format("Baú aberto por %s! Recompensa distribuída.", player.Name))
	
	-- Reativa o baú após 10 segundos
	task.delay(10, function()
		prompt.Enabled = true
	end)
end)
`,
    explanation: 'ProximityPrompt é a ferramenta nativa de interação mais polida do Roblox. O evento PromptButtonHoldBegan permite tocar sons de clique ou abrir menus, enquanto Triggered dispara quando a interação é concluída com sucesso.'
  },
  {
    id: 'lib-hud-stamina',
    name: 'Interface HUD: Barra de Stamina com Interpolação Fluida',
    category: 'Interface',
    type: 'LocalScript',
    location: 'StarterGui > HUD > StaminaBarController',
    description: 'Controle de HUD no cliente que atualiza suavemente a largura de uma barra (UDim2) usando TweenService e muda de cor quando a energia está baixa.',
    tags: ['hud', 'stamina', 'gui', 'tweenservice'],
    code: `--!strict
-- StarterGui/HUD/StaminaBarController.client.luau
local TweenService = game:GetService("TweenService")
local Players = game:GetService("Players")

local player = Players.LocalPlayer
local gui = script.Parent :: ScreenGui
local barFrame = gui:WaitForChild("StaminaBackground"):WaitForChild("BarFill") :: Frame

local currentStamina = 100
local maxStamina = 100

local tweenInfo = TweenInfo.new(0.15, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)

-- Atualiza a barra visualmente
local function updateStaminaUI(newStamina: number)
	currentStamina = math.clamp(newStamina, 0, maxStamina)
	local ratio = currentStamina / maxStamina
	
	-- Altera tamanho suavemente
	local targetSize = UDim2.new(ratio, 0, 1, 0)
	TweenService:Create(barFrame, tweenInfo, {Size = targetSize}):Play()
	
	-- Muda a cor se a stamina estiver crítica (menos de 25%)
	local targetColor = ratio < 0.25 and Color3.fromRGB(239, 68, 68) or Color3.fromRGB(128, 101, 245)
	TweenService:Create(barFrame, tweenInfo, {BackgroundColor3 = targetColor}):Play()
end

-- Exemplo: conectar a eventos de corrida ou regeneração
updateStaminaUI(100)
`,
    explanation: 'Atualizar a barra diretamente via size causa travamentos visuais. Ao utilizar TweenService para interpolar a propriedade Size de UDim2, o medidor parece orgânico e responsivo a qualquer taxa de quadros (60fps, 144fps).'
  }
];
