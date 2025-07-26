export const UserAvatar = ({
  user,
}: {
  user: {
    name: string;
    image: string | undefined | null;
  };
}) => {
  return (
    <div className='flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center border'>
      {user.image ? (
        <img src={user.image} alt={user.name} className='w-full h-full rounded-lg' />
      ) : (
        <span className='text-white text-sm font-medium'>{user.name.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
};

export const OrgAvatar = ({
  org,
}: {
  org: {
    name: string;
    logo?: string | null | undefined;
  };
}) => {
  return (
    <div className='flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center'>
      {org.logo ? (
        <img src={org.logo} alt={org.name} className='w-full h-full rounded-lg' />
      ) : (
        <span className='text-white text-sm font-medium bg-primary'>
          {org.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};
