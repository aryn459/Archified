const PROJECT_PREFIX = 'achified_project_';
const PUBLIC_PROJECT_PREFIX = 'achified_public_project_';

const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({ error: message, ...extra}), {
        status, 
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
};

const getUserId = async (userPuter) =>{
    try{
        const user = await userPuter.auth.getUser();

        return user?.uuid || null;
    }catch{
        return null;
    }
};

router.post('/api/projects/save', async({request, response}) => {
    try{
        const userPuter = user.puter;

        if(!userPuter) return jsonError(401, 'Authentication failed');

        const body = await request.json();
        const project = body?.project;

        if(!project?.id || !project?.sourceImage) return jsonError(400, 'Project id and source image are required');

        const userId = await getUserId(userPuter);
        if(!userId) return jsonError(401, 'Authentication Failed');

        const payload = {
            ...project,
            ownerId: project.ownerId || userId,
            isPublic: false,
            updatedAt: new Date().toISOString(),
        }

        const key = `${PROJECT_PREFIX}${project.id}`;
        await userPuter.kv.set(key, payload);

        return{saved: true, id: project.id, project: payload};

    } catch (e) {
        return jsonError(500, 'Failed to save project', {message: e.message || 'Unknown error'});
    }
});

router.get('/api/projects/list', async ({ user }) =>{
    try{
        const userPuter = user.puter;
        if(!userPuter) return jsonError(401, 'Authentication Failed');

        const userId = await getUserId(userPuter);
        if(!userId) return jsonError(401, 'Authentication Failed');

        const projects = (await userPuter.kv.list(PROJECT_PREFIX, true)).map(({value}) => ({...value, isPublic: false}));
        return {projects};
    } catch(e){
        return jsonError(500, 'Failed to list projects', {message: e.message || 'unknown error'});
    }
});

router.get('/api/projects/public', async () => {
    try {
        const projects = (await puter.kv.list(PUBLIC_PROJECT_PREFIX, true))
            .map(({value}) => ({...value, isPublic: true}));
        return {projects};
    } catch (e) {
        return jsonError(500, 'Failed to list public projects', {message: e.message || 'Unknown error'});
    }
});

router.post('/api/projects/share', async ({ request, user }) => {
    try {
        const userPuter = user.puter;
        if(!userPuter) return jsonError(401, 'Authentication Failed');

        const userId = await getUserId(userPuter);
        if(!userId) return jsonError(401, 'Authentication Failed');

        const { id } = await request.json();
        if(!id) return jsonError(400, 'Project ID is required');

        const privateKey = `${PROJECT_PREFIX}${id}`;
        const publicKey = `${PUBLIC_PROJECT_PREFIX}${id}`;
        const project = await userPuter.kv.get(privateKey);
        if(!project) return jsonError(404, 'Private project not found');
        if(project.ownerId && project.ownerId !== userId) return jsonError(403, 'You do not own this project');

        const profile = await userPuter.auth.getUser();
        const sharedProject = {
            ...project,
            ownerId: userId,
            isPublic: true,
            sharedBy: profile?.username || null,
            sharedById: userId,
            sharedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await puter.kv.set(publicKey, sharedProject);
        await userPuter.kv.del(privateKey);
        return {project: sharedProject};
    } catch (e) {
        return jsonError(500, 'Failed to share project', {message: e.message || 'Unknown error'});
    }
});

router.post('/api/projects/unshare', async ({ request, user }) => {
    try {
        const userPuter = user.puter;
        if(!userPuter) return jsonError(401, 'Authentication Failed');

        const userId = await getUserId(userPuter);
        if(!userId) return jsonError(401, 'Authentication Failed');

        const { id } = await request.json();
        if(!id) return jsonError(400, 'Project ID is required');

        const publicKey = `${PUBLIC_PROJECT_PREFIX}${id}`;
        const privateKey = `${PROJECT_PREFIX}${id}`;
        const project = await puter.kv.get(publicKey);
        if(!project) return jsonError(404, 'Public project not found');
        if(project.ownerId !== userId) return jsonError(403, 'You do not own this project');

        const privateProject = {
            ...project,
            isPublic: false,
            sharedBy: null,
            sharedById: null,
            sharedAt: null,
            updatedAt: new Date().toISOString(),
        };

        await userPuter.kv.set(privateKey, privateProject);
        await puter.kv.del(publicKey);
        return {project: privateProject};
    } catch (e) {
        return jsonError(500, 'Failed to unshare project', {message: e.message || 'Unknown error'});
    }
});

router.get('/api/projects/get', async ({ request, user}) => {
    try{
        const userPuter = user.puter;
        if(!userPuter) return jsonError(401, 'Authentication Failed');

        const userId = await getUserId(userPuter);
        if(!userId) return jsonError(401, 'Authentication Failed');

        const url= new URL(request.url);
        const id = url.searchParams.get('id');

        if(!id) return jsonError(400, 'Project ID is required');

        const privateKey = `${PROJECT_PREFIX}${id}`;
        const publicKey = `${PUBLIC_PROJECT_PREFIX}${id}`;
        const project = await userPuter.kv.get(privateKey) || await puter.kv.get(publicKey);
        
        if(!project) return jsonError(404, 'Project not found');
        return {project};
    }catch (e){
        return jsonError(500, 'Failed to get project', {message: e.message || 'Unknown error'});
    }
});
