export const rootPaths = {
    homeRoot: '',
    authRoot: '/authentication',
    errorRoot: '/error',
};

const paths = {
    home: `/${rootPaths.homeRoot}`,
    login: `${rootPaths.authRoot}/login`,
    logout: `${rootPaths.authRoot}/logout`,
    signup: `${rootPaths.authRoot}/signup`,
    notFound: `${rootPaths.errorRoot}/404`,
};

export default paths;